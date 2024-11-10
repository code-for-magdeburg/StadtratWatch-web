
import sys
import datetime
import os

print("Speaker Diarization")

input_file = sys.argv[1]
output_file = sys.argv[2]
use_auth_token = sys.argv[3]

print("Input file: ", input_file)
print("Output file: ", output_file)

print("Timestamp: ", datetime.datetime.now())

# instantiate the pipeline
from pyannote.audio import Pipeline
pipeline = Pipeline.from_pretrained(
  "pyannote/speaker-diarization-3.1",
  use_auth_token=use_auth_token)

from pyannote.audio.pipelines.utils.hook import ProgressHook
with ProgressHook() as hook:
    diarization = pipeline(input_file, hook=hook)

# dump the diarization output to disk using RTTM format
with open(output_file, "w") as rttm:
    diarization.write_rttm(rttm)

print("Timestamp: ", datetime.datetime.now())
print("Done.")
