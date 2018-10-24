import { NeuralNetwork } from 'brain.js';
import { readFileSync, writeFile } from 'fs';
import { createInterface } from 'readline';
import actions, { normalizeString, sigmoid, findWinner } from './actions';
import { trainDefintions } from './nets';
// import VSR from 'voice-speech-recognition';

const skipWords = [
  'it',
  'me',
  'i',
  'is',
  'the',
  'a',
  'an',
  'hi',
  'for'
];

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

trainDefintions();

const net = new NeuralNetwork();

const utterancesRaw = readFileSync(__dirname + '/../utterances.txt', 'utf-8');

function parseUtterances(u: string) {
  u = normalizeString(u);
  const trainingData = [];
  const lines = u.split('\n').map(line => line.trim()).filter(line => line != '');
  for (let line of lines) {
    if (!(line[0] === '/' && line[1] === '/') && line !== '') {
      const splitLine = line.split(':').map(sl => sl.trim());
      const train: {input: {[prop: string]: number}, output: {[prop: string]: number}} = {input: {}, output: {[splitLine[1]]: 1}};
      const words = splitLine[0].split(' ').map(word => word.trim()).filter(word => skipWords.indexOf(word) === -1);
      for (let word of words) {
        train.input[word] = train.input[word] ? train.input[word] + 1 : 1;
      }
      for (let word of Object.keys(train.input)) {
        train.input[word] = sigmoid(train.input[word]);
      }
      trainingData.push(train);
    }
  }
  return trainingData;
}

function parseLine(line: string) {
  line = normalizeString(line);
  const data: {[prop: string]: number} = {};
  const words = line.split(' ');
  for (let word of words) {
    data[word] = data[word] ? data[word] + 1 : 1;
  }
  for (let word of Object.keys(data)) {
    data[word] = sigmoid(data[word]);
  }
  data["+length"] = sigmoid(line.length);
  data["+numWords"] = sigmoid(words.length);
  return data;
}

const trainingData = parseUtterances(utterancesRaw);

net.train(trainingData);
writeFile(__dirname + '/../trained/index.json', JSON.stringify(net.toJSON()), (err) => err && console.log(err));

function getRequest() {
  rl.question("> ", async answer => {
    const test = parseLine(answer);
    const output: any = net.run(test);
    const results = findWinner(output);
    console.log("Request type: ", results.winner, "    Confidence: ", results.confidence + "%");
    if (results.winner === 'definition') await actions[results.winner](answer);
    getRequest();
  })
}

getRequest();
