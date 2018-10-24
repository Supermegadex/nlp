import { NeuralNetwork } from "brain.js";
import { readFileSync, writeFileSync } from "fs";
import { defs } from "./actions";

const trained: {[prop: string]: NeuralNetwork} = {};

export function trainDefintions() {
  const net = new NeuralNetwork();
  const trainingRaw = readFileSync(__dirname + '/../training/defs.txt', 'utf-8').trim();
  // console.log(trainingRaw);
  const training = trainingRaw.split('\n').map(line => {
    const split = line.split(':');
    const input = defs(split[0].trim());
    const output: any = {};
    for (let i = 0; i < 20; i++) {
      output[i] = 0;
    }
    output[split[1].trim()] = 1;
    return {input, output};
  });
  // console.log(training);
  net.train(training);
  trained.defs = net;
  writeFileSync(__dirname + '/../trained/defs.json', JSON.stringify(net.toJSON()), 'utf-8');
}

export function testDefintions(input: any) {
  return trained.defs.run(input);
}
