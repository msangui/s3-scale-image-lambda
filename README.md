# S3 Image Resize Lambda
A brief example that receives a message from **SQS** when an image is uploaded to a **S3** bucket and resizes
## Setup instructions

### Local terminal
```
$ npm install
$ rm -rf node_modules/sharp
$ npm install --arch=x64 --platform=linux --target=8.10.0 sharp
```
### AWS Console

**Lambda** | Create your Lambda and set its **runtime to Node.js 8.10.**


## Configure AWS CLI
[Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)

```
$ aws configure
```
Input your *aws_access_key*, *aws_secret_access_key* & *aws_session_token* and make sure you set the region to *us-east-1*
[AWS CLI Configure](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)


## Upload Lambda code
```
$ zip -X -r ./lambda-archive.zip *
$ aws lambda update-function-code --function-name FUNCTION_NAME --zip-file fileb://lambda-archive.zip
$ rm ./lambda-archive.zip
```
*Replace **FUNCTION_NAME** with the actual Lambda name*
