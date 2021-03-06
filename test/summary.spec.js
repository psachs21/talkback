import Summary from "../src/summary"

let log;

describe("Summary", () => {
  beforeEach(() => {
    log = td.replace(console, "log")
  })

  afterEach(() => {
    td.reset()
  })

  describe("#print", () => {
    it("prints nothing when there are no new tapes and no unused tapes", () => {
      const summary = new Summary([])

      summary.print()

      td.verify(log(td.matchers.contains("New")), {times: 0})
      td.verify(log(td.matchers.contains("Unused")), {times: 0})
    })

    it("prints the path of new tapes", () => {
      const summary = new Summary([
        {new: true, used: true, path: "path1"},
        {used: true, path: "path2"},
        {new: true, used: true, path: "path3"}
      ])

      summary.print()

      td.verify(log(td.matchers.contains("path1")))
      td.verify(log(td.matchers.contains("path2")), {times: 0})
      td.verify(log(td.matchers.contains("path3")))
    })

    it("prints the path of unused tapes", () => {
      const summary = new Summary([
        {path: "path1"},
        {used: true, path: "path2"},
        {path: "path3"}
      ])

      summary.print()

      td.verify(log(td.matchers.contains("path1")))
      td.verify(log(td.matchers.contains("path2")), {times: 0})
      td.verify(log(td.matchers.contains("path3")))
    })
  })
})