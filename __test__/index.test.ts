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

const Test1 = mongoose.model('Test1', Test1Schema)
const Test2 = mongoose.model('Test2', Test2Schema)
const Test3 = mongoose.model('Test3', Test3Schema)

const dropAll = async () => {
  await Test1.collection.drop()
  await Test2.collection.drop()
  await Test3.collection.drop()
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

  await Test1.insertMany(test1)
  await Test2.insertMany(test2)
  await Test3.insertMany(test3)
})

afterAll(async () => {
  await dropAll()
  await mongoose.disconnect()
})

it('should work well', async () => {
  const res = await refQuery(Test1, {
    test2Id: {
      model: Test2,
      refKey: 'id'
    },
    test3Tid: {
      model: Test3,
      refKey: 'tid',
      destKey: 'test3',
      extQuery: { is_deleted: false }
    }
  })

  expect(res.length).toBe(2)
  res.forEach(r => {
    expect(r.test2Id).toBe(r._test2Id.id)
  })

  res.forEach(r => {
    expect(r.test3Tid).toBe(r.test3.tid)
  })
})

it('origin should works well', async () => {
  const res = await refQuery(Test1)
  expect(res.length).toBe(2)
})
