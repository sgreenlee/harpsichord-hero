import midi_parser

parser = midi_parser.MidiParser("../midi/bach_minuet.mid")
chunks = parser.parse()
