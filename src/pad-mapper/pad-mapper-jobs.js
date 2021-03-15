const Agenda = require('agenda');
const { fetchPadMapperData } = require("../pad-mapper/pad-mapper");
const db = require("../db");

const dbURL = 'mongodb+srv://admin:admin@rentalcluster.thm22.mongodb.net/test?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true&ssl=true';

const agenda = new Agenda({
    db: {address: dbURL, collection: 'ourScheduleCollectionName'},
    processEvery: '20 seconds',
    useUnifiedTopology: true
});

agenda.define('send email report', {priority: 'high', concurrency: 10}, (job, done) => {
    // const {to} = job.attrs.data;
    // emailClient.send({
    //   to,
    //   from: 'Sandeep.karedla1@gmail.com',
    //   subject: 'Email Report',
    //   body: '...'
    // }, done);

    fetchPadMapperData(db);
  }
  );

  (async function() {
    await agenda.start(); // Start Agenda instance

    await agenda.schedule('in 10 minutes', 'log hello medium', {name: 'Medium'}); // Run the dummy job in 10 minutes and passing data.
})();


const databaseNotConnected = () => {
    console.log("Database connection failed");
  };
  
  db.initialize(
    process.env.DATABASE_NAME,
    process.env.PAD_MAPPER_COLLECTION_NAME,
    routes,
    databaseNotConnected
  );
  