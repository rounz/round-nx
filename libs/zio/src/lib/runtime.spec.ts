import { PlatformVoid } from '@round/zio'
import { Runtime } from './runtime'
import { ZIO } from './zio'

describe('Runtime', () => {
  it('unsafeRun succeed', async () => {
    const f = jest.fn(() => 42)
    const z = ZIO.succeedLazy(f)

    const runtime = Runtime.create({}, PlatformVoid)

    await expect(runtime.unsafeRun(z)).resolves.toEqual(void 0)

    expect(f).toHaveReturnedWith(42)
  })

  it('unsafeRun fail', async () => {
    const z = ZIO.fail(42)

    const runtime = Runtime.create({}, PlatformVoid)

    await expect(runtime.unsafeRun(z)).rejects.toEqual(42)
  })
})
