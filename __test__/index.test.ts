import * as mongoose from 'mongoose'
import { refQuery } from '../src'

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/test', {
  useNewUrlParser: true,
  useCreateIndex: true
})

const Test1Schema = new mongoose.Schema({
  name: String,
  test2Id: String,
  test3Tid: String
})

const Test2Schema = new mongoose.Schema({
  name: String,
  id: String
})

const Test3Schema = new mongoose.Schema({
  name: String,
  tid: String,
  is_deleted: {
    type: Boolean,
    default: false
  }
})

const Test4Schema = new mongoose.Schema({
  name: String,
  test1Name: String
})

const Test1 = mongoose.model('Test1', Test1Schema)
const Test2 = mongoose.model('Test2', Test2Schema)
const Test3 = mongoose.model('Test3', Test3Schema)
const Test4 = mongoose.model('Test4', Test4Schema)

const dropAll = async () => {
  await Test1.collection.drop()
  await Test2.collection.drop()
  await Test3.collection.drop()
  await Test4.collection.drop()
}

beforeAll(async () => {
  const test1 = [
    {
      name: 'test11',
      test2Id: 'test2-2',
      test3Tid: 'test3-1'
    },
    {
      name: 'test12',
      test2Id: 'test2-1',
      test3Tid: 'test3-2'
    }
  ]

  const test2 = [
    {
      name: 'test21',
      id: 'test2-1'
    },
    {
      name: 'test22',
      id: 'test2-2'
    }
  ]
  const test3 = [
    {
      name: 'test31',
      tid: 'test3-1'
    },
    {
      name: 'test32',
      tid: 'test3-2'
    }
  ]

  const test4 = [
    {
      name: 'test41',
      test1Name: 'test11'
    },
    {
      name: 'test42',
      test1Name: 'test11'
    }
  ]

  await Test1.insertMany(test1)
  await Test2.insertMany(test2)
  await Test3.insertMany(test3)
  await Test4.insertMany(test4)
})

afterAll(async () => {
  await dropAll()
  await mongoose.disconnect()
})

it('should work well', async () => {
  const res = await refQuery(Test1, [
    {
      id: 'test2-ref',
      key: 'test2Id',
      model: Test2,
      refKey: 'id'
    },
    {
      id: 'test3-ref',
      key: 'test3Tid',
      model: Test3,
      refKey: 'tid',
      destKey: 'test3',
      extQuery: { is_deleted: false }
    },
    {
      id: 'test4-ref',
      key: 'name',
      model: Test4,
      refKey: 'test1Name',
      destKey: 'test4',
      isOne2Many: true
    }
  ])

  expect(res.length).toBe(2)
  res.forEach(r => {
    expect(r.test2Id).toBe(r._test2Id.id)
  })

  res.forEach(r => {
    expect(r.test3Tid).toBe(r.test3.tid)
  })

  const one2manyRes = res.filter(r => r.name === 'test11')
  one2manyRes[0].test4.forEach((res: any) =>
    expect(res.test1Name).toBe('test11')
  )
})

it('origin should works well', async () => {
  const res = await refQuery(Test1)
  expect(res.length).toBe(2)
})
