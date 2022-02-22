"""Decoder for the NEC infrared transmission protocol
Implemented according to this specification:
https://techdocs.altium.com/display/FPGA/NEC+Infrared+Transmission+Protocol
"""

_TOLERANCE = 0.25


class _UnexpectedPulse(Exception):
    pass


class _Pulse(object):

    def __init__(self, durationms):
        duration = durationms / 1000.0
        delta = duration * _TOLERANCE
        self.durationmin = duration - delta
        self.durationmax = duration + delta

    def matches(self, actual):
        return self.durationmin <= actual <= self.durationmax

    def expect(self, actual):
        if not self.matches(actual):
            raise _UnexpectedPulse()


_LEADING  = _Pulse(9.0000)
_BEGINKEY = _Pulse(4.5000)
_REPEAT   = _Pulse(2.2500)
_SPACE    = _Pulse(0.5625)
_BIT0     = _Pulse(0.5625)
_BIT1     = _Pulse(1.6875)
_FINAL    = _Pulse(0.5625)


class IRDecoder(object):

    def __init__(self):
        self._state = self._protocol()
        self._state.send(None)
        self._address = 0
        self._command = 0
        self._keyPressedListeners = []
        self._repeatListeners = []

    def addKeyPressedListener(self, func):
        self._keyPressedListeners.append(func)

    def addRepeatListener(self, func):
        self._repeatListeners.append(func)

    def pulse(self, duration):
        self._state.send(duration)

    def _readbit(self):
        _SPACE.expect((yield))
        duration = (yield)
        if _BIT0.matches(duration):
            return 0
        if _BIT1.matches(duration):
            return 1
        raise _UnexpectedPulse()

    def _readbyte(self):
        value = 0
        for _ in range(0, 8):
            value = (value << 1) | (yield from self._readbit())
        return value

    def _readbyte_with_complement(self):
        value = (yield from self._readbyte())
        complement = (yield from self._readbyte())
        if value ^ complement != 0xff:
            raise _UnexpectedPulse()
        return value

    def _protocol(self):
        while True:
            try:
                _LEADING.expect((yield))
                duration = (yield)
                if _BEGINKEY.matches(duration):
                    self._address = (yield from self._readbyte_with_complement())
                    self._command = (yield from self._readbyte_with_complement())
                    _FINAL.expect((yield))
                    for l in self._keyPressedListeners:
                        l(self._address, self._command)
                elif _REPEAT.matches(duration):
                    _FINAL.expect((yield))
                    for l in self._repeatListeners:
                        l(self._address, self._command)

            except _UnexpectedPulse:
                pass