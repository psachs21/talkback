const fs = require("fs")
const path = require("path")
const JSON5 = require("json5")
const mkdirp = require("mkdirp")
import Tape from "./tape"
import TapeMatcher from "./tape-matcher"

export default class TapeStore {
  constructor(options) {
    this.path = path.normalize(options.path + "/")
    this.options = options
    this.tapes = []
    this.groupOrder = {}
  }

  load() {
    mkdirp.sync(this.path)

    const readFilesTo = (p, recordGroup) => {
      const items = fs.readdirSync(p)
      for (let i = 0; i < items.length; i++) {
        const filename = items[i]
        const fullPath = path.join(p, filename);
        const stat = fs.statSync(fullPath)
        if (!stat.isDirectory()) {
          try {
            const data = fs.readFileSync(fullPath, "utf8")
            const raw = JSON5.parse(data)
            const tape = Tape.fromStore(raw, this.options)
            tape.recordGroup = recordGroup || ''
            
            tape.path = path.join(recordGroup || '', filename)
            if (recordGroup) {
              tape.recordGroup = recordGroup
            }
            this.tapes.push(tape)
          } catch (e) {
            console.log(`Error reading tape ${fullPath}`, e.message)
          }
        } else {
          readFilesTo(fullPath, filename);
        }
      }
    }
    readFilesTo(this.path);
    console.log(`Loaded ${this.tapes.length} tapes`)
  }

  find(newTape, mode) {
    let foundCount = 0;
    const foundTape = this.tapes.find(t => {
      this.options.logger.debug(`Comparing against tape ${t.path}`)
      const isSame = new TapeMatcher(t, this.options).sameAs(newTape);
      if (mode === undefined) {
        return isSame
      }
      if (isSame){
        if (foundCount === (this.groupOrder[t.recordGroup] || 0)) {
          return true
        } else {
          foundCount++
        }
      } 
      return false
    })

    if (foundTape) {
      if (foundTape.recordGroup) {
        if(this.groupOrder[foundTape.recordGroup] === undefined) {
          this.groupOrder[foundTape.recordGroup] = 1
        } else {
          this.groupOrder[foundTape.recordGroup]++
        }
      }
      foundTape.used = true
      this.options.logger.log(`Serving cached request for ${newTape.req.url} from tape ${foundTape.path}`)
      return foundTape
    }
  }

  save(tape) {
    tape.new = true
    tape.used = true
    this.tapes.push(tape)

    const toSave = tape.toRaw()
    const tapeName = `unnamed-${this.tapes.length}.json5`
    tape.path = tapeName
    const filename = path.join(this.path, tape.recordGroup || '', tapeName)
    this.options.logger.log(`Saving request ${tape.req.url} at ${filename}`)
    if (tape.recordGroup) {
      mkdirp.sync(path.join(this.path, tape.recordGroup || ''))
    }
    fs.writeFileSync(filename, JSON5.stringify(toSave, null, 4))
  }

  hasTapeBeenUsed(tapeName) {
    return this.tapes.some(t => t.used && t.path === tapeName)
  }

  resetTapeUsage() {
    return this.tapes.forEach(t => t.used = false)
  }
}
