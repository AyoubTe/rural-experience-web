import {TruncatePipe} from '@rxp/shared/pipes/truncate/truncate-pipe-pipe';

describe('TruncatePipePipe', () => {
  it('create an instance', () => {
    const pipe = new TruncatePipe();
    expect(pipe).toBeTruthy();
  });
});
