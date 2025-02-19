import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

export const getCurrentTimeStamp = (): Timestamp => {
  const currTimestamp = new Timestamp();
  currTimestamp.fromDate(new Date());
  return currTimestamp;
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
