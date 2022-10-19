const crypto = require('crypto');
const { deterministicPartitionKey } = require('.');

describe('deterministicPartitionKey', () => {
  it('when given undefined param, should returns TRIVIAL_PARTITION_KEY', () => {
    const result = deterministicPartitionKey();

    expect(result).toBe('0');
  });

  it('when given empty object, should returns random key hash', () => {
    const result = deterministicPartitionKey({});

    expect(result.length).toBe(128);
    expect(result).toMatch(/c180/);
  });

  it('when given string partitionKey, should returns same partitionKey', () => {
    const partitionKey = crypto.randomUUID();
    const result = deterministicPartitionKey({ partitionKey });

    expect(result).toBe(partitionKey);
  });

  it('when given object partitionKey, should returns the same json stringified partitionKey', () => {
    const partitionKey = { id: crypto.randomUUID(), salt: Math.random() * 10 };
    const result = deterministicPartitionKey({ partitionKey });

    expect(result).toBe(JSON.stringify(partitionKey));
  });

  it('when given array and partition.length > MAX_PARTITION_KEY_LENGTH, should returns hashed partition', () => {
    const partitionKey = Array.from({ length: 256 }, () => 1).toString();
    const result = deterministicPartitionKey({ partitionKey });

    expect(partitionKey.length).toBe(511);
    expect(result.length).toEqual(128);
  });
});
