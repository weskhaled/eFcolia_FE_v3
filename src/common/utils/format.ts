export type instanceObject = Record<string, string>

/**
   * JSON change url parameter
   * @param data Json format data
   * */
export const formatJsonToUrlParams = (data: instanceObject) => {
  return typeof data === 'object'
    ? Object.keys(data)
      .map((key) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
      })
      .join('&')
    : ''
}

export default formatJsonToUrlParams
