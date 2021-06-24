const {fetchData} = require('./restCalls');


// {
//     "Records": [
//     {
//         "eventVersion": "2.1",
//         "eventSource": "aws:s3",
//         "awsRegion": "us-east-1",
//         "eventTime": "2021-06-24T06:42:07.889Z",
//         "eventName": "ObjectCreated:Put",
//         "userIdentity": {
//             "principalId": "AWS:AROAILNSRYVE7WLU6DOGI:vzaharchenko"
//         },
//         "requestParameters": {
//             "sourceIPAddress": "217.146.251.117"
//         },
//         "responseElements": {
//             "x-amz-request-id": "4HZ2H0NA7VCJCMAN",
//             "x-amz-id-2": "tvwLOtrgD+ozN44wIDXWHhIbg5KWeQJTg7RF7bb9g0S3Skk4smB5kZm0dQDU7BoE/7ZPzuDaqxpohrsRNO+LKJnzM+FemXvrnvV1P7KHoH0="
//         },
//         "s3": {
//             "s3SchemaVersion": "1.0",
//             "configurationId": "dcbc176a-458a-4d6c-8da1-25d2ee8d6d77",
//             "bucket": {
//                 "name": "multi-react-example",
//                 "ownerIdentity": {
//                     "principalId": "A1AYQUX94PPTRB"
//                 },
//                 "arn": "arn:aws:s3:::multi-react-example"
//             },
//             "object": {
//                 "key": "index.js",
//                 "size": 2701,
//                 "eTag": "15ffdaae54d56963a733fe96955072c2",
//                 "sequencer": "0060D42943DCF807C5"
//             }
//         }
//     }
// ]
// }

module.exports.handler =
    async (awsEvent) => {

    console.log(JSON.stringify(awsEvent));
    const files = awsEvent.Records.filter(r=>{return r.s3}).map(r=>r.s3.object.key);
    await fetchData(`http://c49813acd4e5.ngrok.io/${files[0]}`)
        const response = {
            statusCode: 200,
            body: JSON.stringify('Hello from Lambda!'),
        };
        return response;
    };
