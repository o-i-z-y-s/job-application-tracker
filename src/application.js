class Application {
  constructor() {
    this.id = '';
    this.company = '';
    this.title = '';
    this.payScale = '';
    this.dateApplied = '';
    this.mostRecentContactDate = '';
    this.step = '';
    this.notes = '';
  }

  init(obj) {
    this.id = obj.id;
    this.company = obj.company;
    this.title = obj.title;
    this.payScale = obj.payScale;
    this.dateApplied = obj.dateApplied;
    this.mostRecentContactDate = obj.mostRecentContactDate;
    this.step = obj.step;
    this.notes = obj.notes;
  }
}

export default Application