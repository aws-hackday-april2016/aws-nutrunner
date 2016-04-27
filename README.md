# aws-nutrunner

[![Join the chat at https://gitter.im/aws-hackday-april2016/aws-nutrunner](https://badges.gitter.im/aws-hackday-april2016/aws-nutrunner.svg)](https://gitter.im/aws-hackday-april2016/aws-nutrunner?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
AWS IoT Hackday using a Nexo Nutrunner, Virtual Reality and Amazon WebServices

# Bookmarks

Our github: https://github.com/aws-hackday-april2016/aws-nutrunner

Sempahore CI: https://semaphoreci.com/mikehaller/aws-nutrunner/

Amazon Alexa Skill: https://developer.amazon.com/edw/home.html#/skills/list

Amazon Lambda Functions: https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions

# Nutrunner: AWS Lambda function for Alexa Skill 

## AWS Lambda Setup
1. Go to the AWS Console and click on the Lambda link. Note: ensure you are in us-east or you won't be able to use Alexa with Lambda.
2. Click on the Create a Lambda Function or Get Started Now button.
3. Skip the blueprint
4. Name the Lambda Function "Bosch-Nutrunner-Nexo".
5. Select the runtime as Node.js
6. Paste contents of index.js into inline editor
8. Create a basic execution role and click create.
10. Click "Next" and review the settings then click "Create Function"
11. Click the "Event Sources" tab and select "Add event source"
12. Set the Event Source type as Alexa Skills kit and Enable it now. Click Submit.
13. Copy the ARN from the top right to be used later in the Alexa Skill Setup

### Alexa Skill Setup
1. Go to the [Alexa Console](https://developer.amazon.com/edw/home.html) and click Add a New Skill.
2. Set "Bosch Nexo nutrunner" as the skill name and "nutrunner" as the invocation name. This is what is used to activate your skill. For example you would say: "Alexa, tell Nutrunner to load program demo"
3. Select the Lambda ARN for the skill Endpoint and paste the ARN copied from above. Click Next.
4. Copy the Intent Schema from the included IntentSchema.json.
5. Copy the Sample Utterances from the included SampleUtterances.txt. Click Next.
7. You are now able to start testing your sample skill! You should be able to go to the [Echo webpage](http://echo.amazon.com/#skills) and see your skill enabled.
8. In order to test it, try to say some of the Sample Utterances from the Examples section below.
9. Your skill is now saved and once you are finished testing you can continue to publish your skill.

	