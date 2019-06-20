const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const stream = require('stream');
const sharp = require('sharp');

const readStreamFromS3 = ({Bucket, Key}) => {
  return S3.getObject({Bucket, Key}).createReadStream();
};

const streamToSharp = ({width, height}) => {
  return sharp()
      .resize(width, height)
      .toFormat('png');
};

const writeStreamToS3 = ({Bucket, Key}) => {
  const pass = new stream.PassThrough();
  return {
    writeStream: pass,
    uploadFinished: S3.upload({
      Body: pass,
      Bucket,
      ContentType: 'image/png',
      Key,
    }).promise(),
  };
};

const respond = (statusCode, message) => ({
  statusCode,
  body: JSON.stringify({message}),
});

exports.handler = async (event) => {
  const width = parseInt(process.env.WIDTH, 10);
  const height = parseInt(process.env.HEIGHT, 10);
  let messageBody;
  let responseStatusCode = 200;
  let responseMessage = 'success';
  let originalImageBucket;
  let originalImageKey;

  try {
    messageBody = JSON.parse(JSON.parse(event.Records[0].body).Message);
    originalImageBucket = messageBody.Records[0].s3.bucket.name;
    originalImageKey = messageBody.Records[0].s3.object.key;
  } catch (e) {
    responseStatusCode = 500;
    responseMessage = e.message;
    return respond(responseStatusCode, responseMessage);
  }

  try {
    const readStream = readStreamFromS3({
      Bucket: originalImageBucket,
      Key: originalImageKey,
    });
    const resizeStream = streamToSharp({width, height});
    const {
      writeStream,
      uploadFinished,
    } = writeStreamToS3({
      Bucket: process.env.BUCKET_NAME,
      Key: originalImageKey,
    });

    // trigger the stream
    readStream
        .pipe(resizeStream)
        .pipe(writeStream);

    await uploadFinished;
  } catch (e) {
    responseStatusCode = 500;
    responseMessage = e.message;
    return respond(responseStatusCode, responseMessage);
  }

  return respond(responseStatusCode, responseMessage);
};
