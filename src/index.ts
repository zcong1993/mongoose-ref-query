import { Model } from 'mongoose'

export interface Options {
  [key: string]: {
    model: Model<any>
    refKey: string
    destKey?: string
  }
}

export const refQuery = async <T = any[]>(
  originModel: Model<any>,
  options: Options = {},
  query: any = {},
  fields: any = {},
  queryOptions: any = {}
) => {
  const originDoc = await originModel.find(query, fields, queryOptions)
  const refsMap: { [key: string]: any } = {}
  for (const key in options) {
    refsMap[key] = {}
    const ids = originDoc.map(d => d[key])
    const refDoc = await options[key].model.find({
      [options[key].refKey]: { $in: ids }
    })
    refDoc.forEach(d => {
      refsMap[key][d[options[key].refKey]] = d
    })
  }

  const res: any = []
  originDoc.forEach(d => {
    const dd = d.toObject()
    for (const key in options) {
      const kk = options[key].destKey ? options[key].destKey : `_${key}`
      dd[kk] = refsMap[key][dd[key]]
    }
    res.push(dd)
  })

  return res as T
}
