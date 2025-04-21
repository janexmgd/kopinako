export default function httpErrorHandle(func, error) {
  if (error?.response) {
    if (error?.response?.status == 429) {
      throw `${func}, ${error.response.statusText}`;
    } else {
      throw `${func}, ${JSON.stringify(error.response.data.errors)}`;
    }
  } else {
    throw error;
  }
}
