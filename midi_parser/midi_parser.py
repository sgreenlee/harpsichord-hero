import json
import pdb
import struct
from midi_notes import GAME_NOTES
from collections import namedtuple

mh_struct = struct.Struct("!xxxxhhh")

Chunk = namedtuple("Chunk", "type content")
MidiHeader = namedtuple("MidiHeader", "format tracks division")
MidiEvent = namedtuple("MidiEvent", "type channel key velocity")
SysexEvent = namedtuple("SysexEvent", "data")
MetaEvent = namedtuple("MetaEvent", "type data")

# Event codes

# Meta Event Codes
SET_TEMPO_CODE = 0x51
TIME_SIGNATURE_CODE = 0x58
KEY_SIGNATURE_CODE = 0x59

MIDI_EVENT_TYPES = {
    0x8: "NOTE_OFF",
    0x9: "NOTE_ON"
}

CONTINUATION_BIT = 1 << 7
BIT_MASK = ~CONTINUATION_BIT


class MidiFile:

    def __init__(self):
        self.tempo = 0.001
        self.tracks = []

    def set_header(self, header_chunk):
        self.format = header_chunk.content.format
        self.division = header_chunk.content.division

    def add_track(self, track):
        self.tracks.append(track)

    def save(self, filename):
        with open(filename, "w") as file:
            file.write(self.to_json())

    def to_json(self):
        output = {}
        output["header"] = {"format": self.format, "division": self.division}
        output["track"] = self.parse_track()
        return json.dumps(output)

    def parse_track(self):
        notes = []
        TRANSPOSE = 5
        current_time = self.division * 3 # add 1 bar delay
        time_threshold = self.division / 2
        counts = {"LEFT": time_threshold + 1, "RIGHT": time_threshold + 1}
        events = self.tracks[1].content
        ms_per_tick = 1.0 / (self.division * self.tempo)
        for delta_time, event in events:
            current_time += delta_time
            counts["LEFT"] += delta_time
            counts["RIGHT"] += delta_time
            if event.type != "NOTE_ON":
                # ignore all events except NOTE_ON
                continue
            else:
                note = GAME_NOTES.get(event.key + TRANSPOSE)
                if note and counts[note["hand"]] > time_threshold:
                    notes.append({
                        "time": int(current_time * ms_per_tick),
                        "note": note["note"]
                    })
                    # reset counter
                    counts[note["hand"]] = 0
        return notes


class MidiParser:

    def __init__(self, filename):
        with open(filename, "rb") as f:
            self.midi_file = f.read()
            self.offset = 0

    def parse(self):
        mf = MidiFile()
        while self.offset < len(self.midi_file):
            chunk = self._readchunk()
            if chunk.type == 'MThd':
                mf.set_header(chunk)
            else:
                mf.add_track(chunk)
        self.offset = 0
        return mf

    def __readbyte(self):
        byte = self.midi_file[self.offset]
        self.offset += 1
        return byte

    def __readbytes(self, n):
        bytes = 0
        for i in range(n):
            bytes << 8
            bytes |= self.__readbyte()
        return bytes

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
            event_type = MIDI_EVENT_TYPES.get(statusbyte >> 4) or statusbyte
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
        if type == TIME_SIGNATURE_CODE:
            return self.__parse_time_signature()
        elif type == KEY_SIGNATURE_CODE:
            return self.__parse_key_signature()
        elif type == SET_TEMPO_CODE:
            return self.__parse_set_tempo()
        else:
            return self.__parse_meta_default(type)

    def __parse_time_signature(self):
        length = self.__parse_variable_length_int()
        nn = self.__readbyte()
        dd = self.__readbyte()
        cc = self.__readbyte()
        bb = self.__readbyte()
        data = {"numerator": nn, "denominator": 2**dd, "cc": cc,
                "bb": bb}
        return MetaEvent(type="SET_TIME_SIGNATURE", data=data)

    def __parse_key_signature(self):
        length = self.__parse_variable_length_int()
        sf = self.__readbyte()
        mi = self.__readbyte()
        data = {"sf": sf, "minor": mi}
        return MetaEvent(type="SET_KEY_SIGNATURE", data=data)

    def __parse_set_tempo(self):
        length = self.__parse_variable_length_int()
        tempo = self.__readbytes(3)
        return MetaEvent(type="SET_TEMPO", data={"tempo": tempo})

    def __parse_meta_default(self, type):
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
