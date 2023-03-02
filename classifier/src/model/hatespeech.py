import datetime as dt
import json

from marshmallow import post_load
from marshmallow import Schema, fields
from .hatespeech_type import HateSpeechType


class HateSpeech():
    def __init__(self, text, type: HateSpeechType):
        self.text = text
        self.type = type

    def __repr__(self):
        return '<HateSpeech(name={self.type!r})>'.format(self=self)

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__,sort_keys=True, indent=4)


'''class HateSpeechSchema(Schema):
    text = fields.Str()
    type = HateSpeechType


class HateSpeechSchema(HateSpeechSchema):
    @post_load
    def make_hatespeech(self, data, **kwargs):
        return HateSpeech(text= data['text'], type=HateSpeechType.NOT_PROCESSED)
        #text = fields.Str()
        #type = fields.bool()'''
