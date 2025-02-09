import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";
import { AxiosError } from "axios";

const headers = {
  accept:
    "image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
};

export async function downloadImage(url: string): Promise<Buffer | undefined> {
  try {
    const response: AxiosResponse<
      Buffer,
      AxiosRequestConfig<undefined>
    > = await axios.get(url, {
      responseType: "arraybuffer",
      headers: headers,
    });

    return response.data;
  } catch (error) {
    console.error("Error downloading image", (error as AxiosError).message);
    return undefined;
  }
}
