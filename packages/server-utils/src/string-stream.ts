import { Readable, PassThrough } from 'stream'

const slice = Array.prototype.slice

class StringToStream extends Readable {
  _str: string

  _encoding: string

  ended: any

  constructor(str: string) {
    super()
    this._str = str
    this._encoding = 'utf8'
  }

  _read() {
    if (!this.ended) {
      process.nextTick(() => {
        // @ts-ignore
        this.push(Buffer.from(this._str, this._encoding))
        this.push(null)
      })
      this.ended = true
    }
  }
}
// check and pause streams for pipe.
function pauseStreams(streams, options) {
  if (!Array.isArray(streams)) {
    // Backwards-compat with old-style streams
    if (!streams._readableState && streams.pipe) {
      streams = streams.pipe(new PassThrough(options))
    }
    if (!streams._readableState || !streams.pause || !streams.pipe) {
      throw new Error('Only readable stream can be merged.')
    }
    streams.pause()
  } else {
    for (let i = 0, len = streams.length; i < len; i += 1) {
      streams[i] = pauseStreams(streams[i], options)
    }
  }
  return streams
}
function mergeStream2(...arg: any[]): Readable {
  const streamsQueue = []
  // eslint-disable-next-line prefer-rest-params
  const args = slice.call(arguments)
  let merging = false
  let options = args[args.length - 1]

  if (options && !Array.isArray(options) && options.pipe == null) {
    args.pop()
  } else {
    options = {}
  }

  const doEnd = options.end !== false
  const doPipeError = true
  if (options.objectMode == null) {
    options.objectMode = true
  }
  if (options.highWaterMark == null) {
    options.highWaterMark = 64 * 1024
  }
  const mergedStream = new PassThrough(options)
  function endStream() {
    merging = false
    // emit 'queueDrain' when all streams merged.
    mergedStream.emit('queueDrain')
    if (doEnd) {
      mergedStream.end()
    }
  }
  function mergeStream() {
    if (merging) {
      return
    }
    merging = true

    let streams = streamsQueue.shift()
    if (!streams) {
      process.nextTick(endStream)
      return
    }
    if (!Array.isArray(streams)) {
      // @ts-ignore
      streams = [streams]
    }
    // eslint-disable-next-line
    // @ts-ignore
    let pipesCount = streams.length + 1

    function next() {
      // eslint-disable-next-line no-plusplus
      if (--pipesCount > 0) {
        return
      }
      merging = false
      mergeStream()
    }
    function pipe(stream) {
      function onerror(err) {
        mergedStream.emit('error', err)
      }
      function onend() {
        stream.removeListener('merge2UnpipeEnd', onend)
        stream.removeListener('end', onend)
        if (doPipeError) {
          stream.removeListener('error', onerror)
        }
        next()
      }

      // skip ended stream
      if (stream._readableState.endEmitted) {
        return next()
      }

      stream.on('merge2UnpipeEnd', onend)
      stream.on('end', onend)

      if (doPipeError) {
        stream.on('error', onerror)
      }

      stream.pipe(mergedStream, { end: false })
      // compatible for old stream
      stream.resume()
    }
    // @ts-ignore
    for (let i = 0; i < streams.length; i += 1) {
      // @ts-ignore
      pipe(streams[i])
    }

    next()
  }
  function addStream() {
    for (let i = 0, len = arguments.length; i < len; i += 1) {
      // @ts-ignore
      // eslint-disable-next-line prefer-rest-params
      streamsQueue.push(pauseStreams(arguments[i], options))
    }
    mergeStream()
    return this
  }

  mergedStream.setMaxListeners(0)
  // @ts-ignore
  mergedStream.add = addStream
  mergedStream.on('unpipe', function (stream) {
    stream.emit('merge2UnpipeEnd')
  })

  if (args.length) {
    // eslint-disable-next-line prefer-spread
    addStream.apply(null, args as [])
  }
  return mergedStream
}

export { StringToStream, mergeStream2 }
