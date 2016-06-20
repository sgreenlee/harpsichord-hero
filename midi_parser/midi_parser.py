import pdb
import struct
from collections import namedtuple

mh_struct = struct.Struct("!xxxxhhh")

Chunk = namedtuple("Chunk", "type content")
MidiHeader = namedtuple("MidiHeader", "format tracks division")
MidiEvent = namedtuple("MidiEvent", "type channel key velocity")
SysexEvent = namedtuple("SysexEvent", "data")
MetaEvent = namedtuple("MetaEvent", "type data")

EVENT_TYPES = {0x8: "NOTE_OFF", 0x9: "NOTE_ON"}
CONTINUATION_BIT = 1 << 7
BIT_MASK = ~CONTINUATION_BIT


class MidiParser:

    def __init__(self, filename):
        with open(filename, "rb") as f:
            self.midi_file = f.read()
            self.offset = 0

    def parse(self):
        self.chunks = []
        while self.offset < len(self.midi_file):
            self.chunks.append(self._readchunk())
        return self.chunks

    def _readchunk(self):
        chunktype = self.midi_file[self.offset:(self.offset + 4)].decode("ascii")
        self.offset += 4
        if chunktype == "MThd":
            return self._parse_header()
        elif chunktype== "MTrk":
            return self._parse_track()

    def _parse_header(self):
        mh = MidiHeader._make(mh_struct.unpack_from(self.midi_file, self.offset))
        self.offset += mh_struct.size
        return Chunk(type="MThd", content=mh)

    def _parse_track(self):
        length = struct.unpack_from("!I", self.midi_file, self.offset)[0]
        self.offset += 4
        starting_offset = self.offset
        events = []
        while self.offset < starting_offset + length:
            events.append(self.__parse_event_time_pair())
        return Chunk(type="MTrk", content=events)

    def __parse_event_time_pair(self):
        delta_time = self.__parse_variable_length_int()
        event = self.__parse_event()
        return (delta_time, event)

    def __parse_event(self):
        statusbyte = self.midi_file[self.offset]
        if (statusbyte == 0xF0 or statusbyte == 0xF7):
            self.offset += 1
            return self.__parse_sysex_event()
        elif (statusbyte == 0xFF):
            self.offset += 1
            return self.__parse_meta_event()
        else:
            return self.__parse_midi_event()

    def __parse_midi_event(self):
            statusbyte = self.midi_file[self.offset]
            event_code = statusbyte >> 4
            channel = statusbyte & 0b1111
            self.offset += 1
            if (event_code == 0xC):
                event_type = "PROGRAM_CHANGE"
                program = self.midi_file[self.offset]
                self.offset += 1
                return MidiEvent(type=event_type, channel=channel, key=program,
                                 velocity=None)
            elif (event_code == 0xD):
                event_type = "CHANNEL_KEY_PRESSURE"
                pressure = self.midi_file[self.offset]
                self.offset += 1
                return MidiEvent(type=event_type, channel=channel, key=pressure,
                                 velocity=None)
            else:
                event_type = EVENT_TYPES.get(statusbyte >> 4) or statusbyte
                key = self.midi_file[self.offset]
                self.offset += 1
                velocity = self.midi_file[self.offset]
                self.offset += 1
                return MidiEvent(type=event_type, channel=channel, key=key,
                             velocity=velocity)

    def __parse_sysex_event(self):
        length = self.__parse_variable_length_int()
        data = self.midi_file[self.offset:self.offset + length]
        self.offset += length
        return SysexEvent(data=data)

    def __parse_meta_event(self):
        type = self.midi_file[self.offset]
        self.offset += 1
        length = self.__parse_variable_length_int()
        data = self.midi_file[self.offset:self.offset + length]
        self.offset += length
        return MetaEvent(type=type, data=data)

    def __parse_variable_length_int(self):
        return_value = 0
        while True:
            return_value <<= 7
            newbyte = self.midi_file[self.offset]
            return_value |= (newbyte & BIT_MASK)
            self.offset += 1
            if not (newbyte & CONTINUATION_BIT):
                break
        return return_value
