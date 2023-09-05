import { ClientReadableStream } from '@grpc/grpc-js';
import * as grpc from '@grpc/grpc-js';
import { ModelInferRequest, ModelInferResponse } from '../proto/out/proto/model_infer_pb';
import { UpdateInferenceStateRequest } from '../proto/out/proto/write2db_pb';
import { ModelInferClient } from '../proto/out/proto/model_infer_grpc_pb';
import { UpdateInferenceStateClient } from '../proto/out/proto/write2db_grpc_pb';

const DB_SERVER = '127.0.0.1:7777';
const INFERENCE_SERVER = '127.0.0.1:7780';

// const DB_SERVER = 'rpc.keysight-copilot.com:7777';
// const INFERENCE_SERVER = 'rpc.keysight-copilot.com:7780';

export const dbClient = new UpdateInferenceStateClient(DB_SERVER, grpc.credentials.createInsecure());
export const inferenceClient = new ModelInferClient(INFERENCE_SERVER, grpc.credentials.createInsecure());



export async function modelInferAsync(prefix: string, suffix: string, numResponse: number): Promise<string> {
    console.log("modelInferAsync");
    const request = new ModelInferRequest();
    request.setPrefix(prefix);
    request.setSuffix(suffix);
    request.setNumResponses(numResponse);
    console.log("prefix: ", prefix);
    // let generatedText;
    return new Promise<string>((resolve, reject) => {
        const stream: ClientReadableStream<ModelInferResponse> = inferenceClient.getCode(request);
        const generatedTextList: string[] = [];
        // let generatedText = "";

        stream.on('data', (response: ModelInferResponse) => {
            // generatedText = response.getResponseList()[0];
            // const generatedTextList: string[] = response.getResponseList();
            const [firstResponse] = response.getResponseList();
            console.log("firstResponse: ", firstResponse);
            generatedTextList.push(firstResponse);
        });

        stream.on('error', (error: grpc.ServiceError) => {
            reject(error);
        });

        stream.on('end', () => {
            const concatenatedText: string = generatedTextList.join('');
            // const trimmedText: string = concatenatedText.endsWith('\n') ? concatenatedText.slice(0, -1) : concatenatedText;
            resolve(concatenatedText);
        });
    });
}

export function updateInferenceState(inferId: number, state: number) {
    const request = new UpdateInferenceStateRequest();
    request.setInferenceId(inferId);
    request.setState(state);
    dbClient.updateInference(request, (error, ) => {
      if (error) {
        console.error('Error making gRPC call:', error);
      } 
    //   else {
    //   }
    });
  }