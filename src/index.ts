import { Model } from 'mongoose'

export interface Option {
  model: Model<any>
  key: string
  refKey: string
  destKey?: string
  extQuery?: any
  isOne2Many?: boolean
}

export const refQuery = async <T = any[]>(
  originModel: Model<any>,
  options: Option[] = [],
  query: any = {},
  fields: any = {},
  queryOptions: any = {}
) => {
  const originDoc = await originModel.find(query, fields, queryOptions)
  const refsMap: { [key: string]: any } = {}
  for (const option of options) {
    const key = option.key
    refsMap[key] = {}
    const ids = originDoc.map(d => d[key])
    const extQuery = option.extQuery || {}
    const refDoc = await option.model.find({
      [option.refKey]: { $in: ids },
      ...extQuery
    })
    refDoc.forEach(d => {
      if (option.isOne2Many) {
        refsMap[key][d[option.refKey]] = !refsMap[key][d[option.refKey]]
          ? [d]
          : [...refsMap[key][d[option.refKey]], d]
      } else {
        refsMap[key][d[option.refKey]] = d
      }
    })
  }

  const res: any = []
  originDoc.forEach(d => {
    const dd = d.toObject()
    for (const option of options) {
      const key = option.key
      const kk = option.destKey ? option.destKey : `_${key}`
      dd[kk] = refsMap[key][dd[key]]
    }
    res.push(dd)
  })

  return res as T
}
