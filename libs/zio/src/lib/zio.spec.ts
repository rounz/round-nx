import { ZIO } from './zio'
import * as E from 'fp-ts/lib/Either'
import { Either } from 'fp-ts/lib/Either'

const expectLeft = <E, A>(result: Either<E, A>) =>
  expect(E.isLeft(result) && result.left)

const expectRight = <E, A>(result: Either<E, A>) =>
  expect(E.isRight(result) && result.right)

describe('ZIO bindings', () => {
  it('succeed', async () => {
    const z = ZIO.succeed(42)
    const result = await z()()

    expectRight(result).toEqual(42)
  })

  it('fail', async () => {
    const z = ZIO.fail('Uh oh!')
    const result = await z()()

    expectLeft(result).toEqual('Uh oh!')
  })

  it('fromTry should be lazy', () => {
    const f = jest.fn()

    ZIO.fromTry(f)
    ZIO.fromTry(f)()

    expect(f).not.toHaveBeenCalled()
  })

  it('fromTry fail', async () => {
    const z = ZIO.fromTry(() => {
      throw 27
    })
    const result = await z()()

    expectLeft(result).toEqual(27)
  })

  it('fromTry succeed', async () => {
    const z = ZIO.fromTry(() => 31)
    const result = await z()()

    expectRight(result).toEqual(31)
  })
})
