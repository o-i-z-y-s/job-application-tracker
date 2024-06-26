<template>
  <div>
    <div class="scrollbars">
      <table class="table table-dark table-hover">
        <thead class="">
          <tr>
            <th scope="col"><img class="icon" src="../assets/sort-solid.svg"></th>
            <th scope="col" @click="sort('id')">#</th>
            <th scope="col" @click="sort('company')">Company</th>
            <th scope="col" @click="sort('title')">Title</th>
            <th scope="col" @click="sort('payScale')">💰 Est.</th>
            <th scope="col" @click="sort('dateApplied')">Apply Date</th>
            <th scope="col" @click="sort('mostRecentContactDate')">Last Contact</th>
            <th scope="col" @click="sort('step')">Step</th>
            <th scope="col" @click="sort('notes')">📝</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="application, index in sorted" :key="index" :class="getStepStyle(application.step)">
            <td><img class="clickable-icon" :class="{ 'filter': doFilter(application.step) }" src="../assets/square-minus-whitesmoke.svg" @click="removeRow(index)"></td>
            <td>{{ application.id }}</td>
            <td><table-cell :val="application.company" uid="company" :index="index" @update="update" /></td>
            <td><table-cell :val="application.title" uid="title" :index="index" @update="update" /></td>
            <td><table-cell :val="application.payScale" uid="payScale" :index="index" @update="update" /></td>
            <td><table-cell :val="application.dateApplied" uid="dateApplied" :index="index" @update="update" /></td>
            <td><table-cell :val="application.mostRecentContactDate" uid="mostRecentContactDate" :index="index" @update="update" /></td>
            <td><table-cell :val="application.step" uid="step" :index="index" @update="update" /></td>
            <td><table-cell :val="application.notes" uid="notes" :index="index" @update="update" /></td>
          </tr>
          <tr class="">
            <td style="cursor: pointer;" @click="addRow"><img class="clickable-icon" src="../assets/square-plus-whitesmoke.svg"></td>
            <td v-for="i in Array(8)" :key="i"></td>
          </tr>
        </tbody>
      </table>
    </div>
    <em>Click a cell to edit.</em>
    <br>
    <div v-if="mobile" class="portrait-message">
      (Psst. The table fits better in landscape. <img class="icon" src="../assets/arrows-rotate-solid.svg">)
    </div>
    <div class="btn-row">
      <button class="btn btn-dark" style="margin-top: 1rem;" @click="download">Download as CSV</button>
      <button class="btn btn-dark" style="margin-top: 1rem;" @click="save" :disabled="storageDisabled">Save to Browser Storage</button>
    </div>
    <div v-if="storageDisabled" style="font-size: 0.9rem;">
      You (might) have local storage disabled in your browser settings, so you'll need to download to save.<br>
    </div>
    <div style="height: 1.5rem;">
      <p ref="saveMessage" class="save-message" :style="{ 'color': (message === 'Saved successfully.' ? 'greenyellow' : 'red') }">{{ message }}</p>
    </div>
    <a style="visibility: hidden;" href="/Job Application Tracker" download></a>
  </div>
</template>

<script>
import TableCell from './TableCell.vue';
import Application from '../application.js';
const _ = require('lodash');

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
      fields: ['id','company','title','payScale','dateApplied','mostRecentContactDate','step','notes'],
      mobile: false,
      message: '',
      // cookiesDisabled: false,
      storageDisabled: false,
      sortKey: 'id',
      lastSortKey: ''
    }
  },
  computed: {
    sorted: function(e) {
      if (this.sortKey === this.lastSortKey) {
        return _.orderBy(this.applications, [application => application[e.sortKey].toLowerCase()], ['desc']);
      } else {
        return _.orderBy(this.applications, [application => application[e.sortKey].toLowerCase()], ['asc']);
      }
    }
  },
  mounted: function() {
    this.applications = this.applicationsOrig;
    this.checkDevice();
    this.isStorageEnabled();
  },
  methods: {
    sort(val) {
      if (val === this.sortKey && val === this.lastSortKey) {
        this.lastSortKey = '!' + this.sortKey;
      } else { this.lastSortKey = this.sortKey; }
      this.sortKey = val;
    },

    update(newVal, index, uid) {
      this.applications[index][uid] = newVal;
    },

    addRow() {
      this.addingRow = true;
      let app = new Application();
      app.id = String(this.applications.length + 1);
      this.applications.push(app);
    },
    
    removeRow(index) {
      this.applications.splice(index, 1);
    },

    buildTracker() {
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

      return content;
    },

    download() {
      let content = this.buildTracker();

      let csvContent = content.map(e => e.join(",")).join("\n");
      let csvData = new Blob([csvContent], {type: 'data:text/csv;charset=utf-8,'});
      let link = document.createElement('a');
      link.href = window.URL.createObjectURL(csvData);
      link.setAttribute('download', this.getFileName());
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    save() {
      let content = this.buildTracker();

      try {
        window.localStorage.setItem('content', JSON.stringify(content));
        this.message = 'Saved successfully.';
      }
      catch {
        this.message = 'Failed to save. Check your browser storage settings.';
      }

      this.$refs.saveMessage.style.display = 'block';
      this.$refs.saveMessage.classList.value += ' fade-in-fade-out';
      setTimeout(() => {
        this.$refs.saveMessage.style.display = 'none';
      }, 2500);
    },

    getFileName() {
      let now = new Date();
      let month = now.getMonth() + 1;
      let seconds = (now.getSeconds() === '0' ? '12': now.getSeconds());
      return 'Job Application Tracker ' + now.getFullYear() + '-' + month + '-' + now.getDate()
          + ' ' + now.getHours() + '-' + now.getMinutes() + '-' + seconds + '.csv';
    },

    getStepStyle(step) {
      switch (step) {
        case 'Applied': return 'table-light';
        case 'Phone Screen': return 'table-info';
        case 'Assessment': return 'table-primary';
        case 'Onsite': return 'table-secondary';
        case 'Accepted': return 'table-success';
        case 'Rejected': return 'table-danger';
        case 'Closed': return 'table-dark';
      }
    },

    doFilter(step) {
      return step !== 'Closed' && step !== '';
    },

    checkDevice() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        this.mobile = true;
      } else { this.mobile = false; }
    },

    isStorageEnabled() {
      window.localStorage.setItem('test', 'test');
      try {
        window.localStorage.getItem('test');
      }
      catch {
        this.storageDisabled = true;
      }
    },

    // areCookiesEnabled() {
    //   document.cookie = "test=test;SameSite=None";
    //   try {
    //     const cookieValue = document.cookie
    //       .split("; ")
    //       .find((row) => row.startsWith("test="))
    //       ?.split("=")[1];
        
    //     if (cookieValue !== 'test') {
    //       throw new Error('cookies disabled');
    //     }
    //   }
    //   catch {
    //     this.cookiesDisabled = true;
    //   }
    // },

    // saveToCookies() {
    //   let expDate = new Date;
    //   expDate.setFullYear(expDate.getFullYear() + 10);
    //   let content = this.buildTracker();

    //   try {
    //     var cookies = document.cookie.split(';');
    //     for (var i = 0; i < cookies.length; i++) {
    //       document.cookie = cookies[i] + "=; expires="+ new Date(0).toUTCString();
    //     }
        
    //     this.$nextTick(() => {
    //       document.cookie = 'content=' + JSON.stringify(content) + '; expires=' + expDate.toUTCString() +';';
    //       this.message = 'Saved successfully.';
    //     });
    //   }
    //   catch {
    //     this.message = 'Failed to save. Check your browser cookie settings.';
    //   }
    // },
  }
}
</script>

<style scoped>
.icon {
  height: 1.5em;
  width: 1.5em;
  cursor: default;
}
.clickable-icon {
  cursor: pointer;
}
.filter {
  filter: invert(1);
}

.btn {
  color: whitesmoke;
  border: 1px solid whitesmoke;
  border-radius: 0.25rem;
  margin: 0 1rem 1rem 1rem;
}

.btn-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.scrollbars {
  max-width: 100dvw;
  overflow: hidden;
}
.portrait-message {
  display: none;
}
td, th {
  text-align: center;
  vertical-align: middle;
}
th {
  cursor: pointer;
}
.save-message {
  display: none;
  opacity: 0%;
}
.fade-in-fade-out {
  animation: fadeinfadeout 2s;
}
@keyframes fadeinfadeout {
  0% {
    opacity: 0%;
  }
  25% {
    opacity: 100%;
  }
  75% {
    opacity: 100%;
  }
  100% {
    opacity: 0%;
  }
}

@media screen and (orientation: portrait) {
  .portrait-message {
    display: block;
  }
}

@media screen and (max-width: 429px) {
  .scrollbars {
    overflow: scroll;
  }
}
</style>
