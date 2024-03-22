<template>
  <div>
    <table class="table table-hover">
      <thead class="table-light">
        <tr>
          <th scope="col"></th>
          <th scope="col">#</th>
          <th scope="col">🏢</th>
          <th scope="col">Title</th>
          <th scope="col">💰 Est.</th>
          <th scope="col">Apply 📅</th>
          <th scope="col">📅 Last Comm</th>
          <th scope="col">Step</th>
          <th scope="col">📝</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="application, index in applications" :key="index" :class="getStepStyle(application.step)">
          <th scope="row"><img class="table-icon" :class="{ 'invert': application.step === 'Closed' }" src="../assets/square-minus-regular.svg" @click="removeRow(index)"></th>
          <td>{{ Number(index) + 1 }}</td>
          <td><table-cell :val="application.company" uid="company" :index="index" @update="update" /></td>
          <td><table-cell :val="application.title" uid="title" :index="index" @update="update" /></td>
          <td><table-cell :val="application.payScale" uid="payScale" :index="index" @update="update" /></td>
          <td><table-cell :val="application.dateApplied" uid="dateApplied" :index="index" @update="update" /></td>
          <td><table-cell :val="application.mostRecentContactDate" uid="mostRecentContactDate" :index="index" @update="update" /></td>
          <td><table-cell :val="application.step" uid="step" :index="index" @update="update" /></td>
          <td><table-cell :val="application.notes" uid="notes" :index="index" @update="update" /></td>
        </tr>
        <tr class="table-light">
          <td style="cursor: pointer;" @click="addRow"><img class="table-icon" src="../assets/square-plus-regular.svg"></td>
          <td v-for="i in Array(8)" :key="i"></td>
        </tr>
      </tbody>
    </table>
    <em>Click a cell to edit.</em>
    <br>
    <button class="btn btn-light" style="margin-top: 1rem;" @click="download">Download as CSV</button>
    <a style="visibility: hidden;" href="/Application Tracker" download></a>
  </div>
</template>

<script>
import TableCell from './TableCell.vue';
import Application from '../application.js';

export default {
  components: { TableCell },
  name: 'ApplicationTracker',
  props: {
    applicationsOrig: {
      type: Array,
      required: true
    }
  },
  data: function() {
    return {
      applications: {},
      fields: ['company','title','payScale','dateApplied','mostRecentContactDate','step','notes'],
    }
  },
  mounted: function() {
    this.applications = this.applicationsOrig;
  },
  methods: {
    update(newVal, index, uid) {
      this.applications[index][uid] = newVal;
    },

    addRow() {
      this.applications.push(new Application());
    },
    
    removeRow(index) {
      this.applications.splice(index, 1);
    },

    download() {
      // forgive me for this sin
      let content = [];
      for (let i = 0; i < this.applications.length; i++) {
        let application = [];
        for (let j = 0; j < this.fields.length; j++) {
          let field = this.fields[j];
          application.push(this.applications[i][field]);
        }
        content.push(application);
      }

      let csvContent = content.map(e => e.join(",")).join("\n");
      let csvData = new Blob([csvContent], {type: 'data:text/csv;charset=utf-8,'});
      let link = document.createElement('a');
      link.href = window.URL.createObjectURL(csvData);
      link.setAttribute('download', this.getFileName());
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    getFileName() {
      let now = new Date();
      let month = now.getMonth() + 1;
      let seconds = (now.getSeconds() === '0' ? '12': now.getSeconds());
      return 'Application Tracker ' + now.getFullYear() + '-' + month + '-' + now.getDate()
          + ' ' + now.getHours() + '-' + now.getMinutes() + '-' + seconds + '.csv';
    },

    getStepStyle(step) {
      switch (step) {
        case 'Applied': return;
        case 'Phone Screen': return 'table-light';
        case 'Assessment': return 'table-info';
        case 'Onsite': return 'table-primary';
        case 'Accepted': return 'table-success';
        case 'Rejected': return 'table-danger';
        case 'Closed': return 'table-dark';
      }
    },
  }
}
</script>

<style scoped>
.table-icon {
  height: 1.5em;
  width: 1.5em;
  cursor: pointer;
}
.invert {
  filter: invert(1);
}
button {
  margin-bottom: 1rem;
}
</style>