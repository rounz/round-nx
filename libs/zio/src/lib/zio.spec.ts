import * as E from 'fp-ts/lib/Either'
import { Either } from 'fp-ts/lib/Either'
import { ZIO } from './zio'

const expectLeft = <E, A>(result: Either<E, A>) =>
  expect(E.isLeft(result) && result.left)

const expectRight = <E, A>(result: Either<E, A>) =>
  expect(E.isRight(result) && result.right)

describe('ZIO bindings', () => {
  it('succeed', async () => {
    const z = ZIO.succeed(42)
    const result = await z(null)()

    expectRight(result).toEqual(42)
  })

  it('fail', async () => {
    const z = ZIO.fail('Uh oh!')
    const result = await z(null)()

    expectLeft(result).toEqual('Uh oh!')
  })

  it('fromTry should be lazy', () => {
    const f = jest.fn()

    ZIO.fromTry(f)
    ZIO.fromTry(f)(null)

    expect(f).not.toHaveBeenCalled()
  })

  it('fromTry fail', async () => {
    const z = ZIO.fromTry(() => {
      throw 27
    })
    const result = await z(null)()

    expectLeft(result).toEqual(27)
  })

  it('fromTry succeed', async () => {
    const z = ZIO.fromTry(() => 31)
    const result = await z(null)()

    expectRight(result).toEqual(31)
  })

  it('zip', async () => {
    const z1 = ZIO.succeedLazy(() => 4)
    const z2 = ZIO.succeedLazy(() => '2')

    const z3 = ZIO.zip(z1, z2)
    const result = await z3({})()

    expectRight(result).toEqual([4, '2'])
  })

  it('zipPar', async () => {
    const z1 = ZIO.succeedLazy(() => 4)
    const z2 = ZIO.succeedLazy(() => '2')

    const z3 = ZIO.zipPar(z1, z2)
    const result = await z3({})()

    expectRight(result).toEqual([4, '2'])
  })
})
