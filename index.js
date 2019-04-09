const AWS = require('aws-sdk');
const stream = require('stream');
const ChartjsNode = require('chartjs-node');

// 600x600 canvas size
var chartNode = new ChartjsNode(600, 600);
var chartJsOptions = {
          type: 'bar',
          data: {
                    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                    datasets: [{
                              label: '# of Votes',
                              data: [12, 19, 3, 5, 2, 3],
                              backgroundColor: [
                                        'rgba(255, 99, 132, 0.2)',
                                        'rgba(54, 162, 235, 0.2)',
                                        'rgba(255, 206, 86, 0.2)',
                                        'rgba(75, 192, 192, 0.2)',
                                        'rgba(153, 102, 255, 0.2)',
                                        'rgba(255, 159, 64, 0.2)'
                              ],
                              borderColor: [
                                        'rgba(255,99,132,1)',
                                        'rgba(54, 162, 235, 1)',
                                        'rgba(255, 206, 86, 1)',
                                        'rgba(75, 192, 192, 1)',
                                        'rgba(153, 102, 255, 1)',
                                        'rgba(255, 159, 64, 1)'
                              ],
                              borderWidth: 1
                    }]
          },
          options: {
                    responsive: false,
                    width: 400,
                    height: 400,
                    animation: false,
                    scales: {
                              yAxes: [{
                                        ticks: {
                                                  beginAtZero: true
                                        }
                              }]
                    },
                    tooltips: {
                              mode: 'label'
                    }
          }
};

const s3 = new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

return chartNode.drawChart(chartJsOptions)
          .then(() => {
                    console.log("Chart created as png buffer")
                    return chartNode.getImageBuffer('image/png');
          })
          .then(buffer => {
                    console.log("Chart converted to a stream")
                    Array.isArray(buffer) // => true
                    return chartNode.getImageStream('image/png');
          })
          .then(streamResult => {
                    console.log("Attempt upload to S3")
                    streamResult.stream.pipe(uploadFromStream(s3));
                    streamResult.length // => Integer length of stream
                    // write to a file
                    return chartNode.writeImageToFile('image/png', './testimage.png');
          })
          .catch((error) => {
                    console.log('when a reject is executed it will come here ignoring the then statement ', error)
          });

function uploadFromStream(s3) {
          var pass = new stream.PassThrough();
          console.log("In upload from stream")

          var params = { Bucket: 'nlp-poc', Key: '/ui/charts/1.png', Body: pass };
          s3.upload(params, function (err, data) {
                    console.log(err, data);
          });

          return pass;
}