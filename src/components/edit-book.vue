<template>
  <div>
    <div class="modal-container">
      <div class="maxwidth" id="modal">
        <router-link v-if="isAdmin" :to="{name: 'adminBookList', query: $route.query}" class="close"><i class="fa fa-times"></i> Sulje</router-link>
        <router-link v-else :to="{name: 'sellSingle', params: {id: $route.params.id}}" class="close"><i class="fa fa-times"></i> Sulje</router-link>

        <h2>Muokkaa: {{ book.name}}</h2>

        <div class="left">

          <div class="title">Nimi:</div>
          <input v-model.trim="book.name" required />

          <div class="title">Kurssi:</div>
          <input v-model.trim="book.course" />

          <div class="title">Kustantaja:</div>
          <input v-model.trim="book.publisher" />

          <div class="title">Painovuosi:</div>
          <input v-model.trim="book.year" type="number" />

        </div><div class="right">

          <div class="title">Kunto:</div>
          <div class="condition">
            <div v-if="book.condition != null">
              <i class="fa fa-star" v-for="n in parseInt(book.condition)"></i><i class="fa fa-star-o" v-for="n in (5-book.condition)"></i>
            </div>
            <select v-model="book.condition">
              <option value="0">Ei määritelty</option>
              <option value="1">Surkea</option>
              <option value="2">Välttävä</option>
              <option value="3">Kohtalainen</option>
              <option value="4">Hyvä</option>
              <option value="5">Erinomainen</option>
            </select>
          </div>

          <div class="title">Kuvaus:</div>
          <textarea v-model.trim="book.info"></textarea>

          <div class="title">Hinta ostajalle:</div>
          <input v-model.number.trim="price_euros" type="number" min="5" max="100" required/>&nbsp;euroa
          <input v-model.number.trim="price_cents" type="number" min="0" max="90" step="10" required/>&nbsp;senttiä
          <div class="title">Myyjä saa rahaa:</div>
          <div class="price"><currency :amount="book.price - TOTAL_FEE" /></div>
        </div>

        <div class="danger" v-if="isAdmin">
          <h3>Vaaralliset asetukset: muuta vain jos tiedät mitä teet</h3>
          <div class="title">Tila:</div>
          <select v-model="book.status">
            <option value="-1">Poistettu</option>
            <option value="0">Myynnissä</option>
            <option value="1">Ostettu, odottaa toimitusta koululle</option>
            <option value="2">Toimitettu koululle, odottaa noutoa</option>
            <option value="3">Noudettu, odottaa tilitystä</option>
            <option value="4">Tilitetty</option>
          </select>

          <div class="status">
            <span v-if="book.status == -1"><i class="fa fa-trash"></i></span>
            <span v-if="book.status == 0"><i class="fa fa-check"></i></span>
            <span v-if="book.status == 1"><i class="fa fa-sign-in"></i></span>
            <span v-if="book.status == 2"><i class="fa fa-sign-out"></i></span>
            <span v-if="book.status == 3"><i class="fa fa-handshake-o"></i></span>
            <span v-if="book.status == 4"><i class="fa fa-thumbs-up"></i></span>
          </div>

          <div class="title">Myyjän id-numero:</div>
          <input v-model.number.trim="book.user"/>

          <div class="title">Ostajan id-numero:</div>
          <input v-model.number.trim="book.buyer"/>

          <div class="title">Säilytyskoodi:</div>
          <input v-model.number.trim="book.code"/>
        </div>


        <div v-if="!isAdmin" class="bottom status block">
          <span v-if="book.status === -1"><i class="fa fa-trash"></i>   <span>Poistettu</span></span>
          <span v-if="book.status === 0"><i class="fa fa-check"></i>   <span>Myynnissä</span></span>
          <span v-if="book.status === 1"><i class="fa fa-clock-o"></i> <span>Kirjaa odotetaan koululla</span></span>
          <span v-if="book.status >= 2"><i class="fa fa-handshake-o green"></i>   <span>Myyty</span></span>
        </div>

        <div class="bottom" v-if="isEditable">
          <div v-if="apiMessage" class="api-message">{{ apiMessage }}</div>
          <div v-if="apiError" class="api-error">{{ apiError }}</div>
          <router-link :to="{name: 'adminBookList', query: $route.query}" class="button btn-m" v-if="!deleteConfirmOpen && isAdmin"><i class="fa fa-undo"></i> &nbsp; Peruuta</router-link>
          <router-link :to="{name: 'sellSingle', params: {id: $route.params.id}}" class="button btn-m" v-else-if="!deleteConfirmOpen"><i class="fa fa-undo"></i> &nbsp; Peruuta</router-link>
          <div class="button btn-m" @click="save" v-if="!deleteConfirmOpen"><i class="fa fa-floppy-o"></i> &nbsp; Tallenna</div>
          <br>
          <div class="button btn-s btn-red"  @click="deleteConfirmOpen = true" v-if="!deleteConfirmOpen && isAdmin"><i class="fa fa-trash"></i> &nbsp; Poista kirja</div>
          <div class="box" v-show="deleteConfirmOpen">
            <h3>Haluatko varmasti poistaa kirjan palvelusta?</h3>
            <strong>Tätä tarvitsee tehdä <u>hyvin harvoin</u></strong>
            <strong v-if="book.status > 0 && book.status <= 2">Kirja on jo myyty, eli joudut tiedottamaan ostajalle ettei hän saakaan kirjaa</strong><br/>
            <div class="button btn-m" @click="deleteConfirmOpen=false">Peruuta</div>
            <div class="button btn-m btn-red" @click="poista">Kyllä, poista</div>
          </div>
        </div>
        <div v-else class="api-error bottom">Et voi poistaa tai muokata ilmoitusta jos kirja on jo myyty. Jos et pysty toimittamaan kirjaa koska olet jo myynyt sen muualle, ota mahdollisimman pian yhteyttä palvelun ylläpitoon.</div>
      </div>
    </div>
    <div class="fade"></div>
  </div>
</template>

<script>
import axios from 'axios'
import auth from '../api/auth'
import {EventBus} from '../EventBus'
import Currency from './currency'
import {TOTAL_FEE} from '../Static'

export default {
  name: 'edit-book',
  components: {
    'currency': Currency
  },
  data () {
    return {
      book: {},
      deleteConfirmOpen: false,
      apiMessage: null,
      apiError: null,
      TOTAL_FEE: TOTAL_FEE
    }
  },
  props: ['id'],
  created () {
    this.load()
  },
  methods: {
    load: function () {
      EventBus.$emit('setLoading', true)
      axios.post('/book/get/' + this.id, {
        token: auth.getToken()
      }).then(response => {
        this.book = response.data.data
      }).catch(error => {
        if (error.response.status === 400) {
          console.log('Invalid token')
        } else {
          console.log('Error ' + error.response.status)
        }
      }).then(() => {
        EventBus.$emit('setLoading', false)
      })
    },
    save: function () {
      axios.post('/book/edit/' + this.id, {
        token: auth.getToken(),
        data: this.book
      }).then(response => {
        if (response.data.success) {
          this.apiMessage = 'Kirja tallennettu'
          this.load()
        } else {
          this.apiError = 'Kirjan tallentamisessa tapahtui virhe'
        }
      }).catch(error => {
        if (error.response.status === 400) {
          console.log('Invalid token')
          this.apiError = 'Kirjan tallentaminen ei onnistu, virhe 400'
        } else {
          console.log('Error ' + error.response.status)
          this.apiError = 'Kirjan tallentaminen ei onnistu, virhe ' + error.response.status
        }
      }).then(() => {
        setTimeout(() => {
          this.apiMessage = null
          this.apiError = null
        }, 5000)
      })
    },
    poista: function () {
      axios.post('/book/delete/' + this.id, {
        token: auth.getToken()
      }).then(response => {
        if (response.data.success) {
          alert('Kirjan poisto onnistui!')
          this.back()
        } else {
          this.apiError = 'Kirjan poisto ei onnistu'
        }
      }).catch(error => {
        if (error.response.status === 400) {
          console.log('Invalid token')
          this.apiError = 'Kirjan poisto ei onnistu, virhe 400'
        } else {
          console.log('Error ' + error.response.status)
          this.apiError = 'Kirjan poisto ei onnistu, virhe ' + error.response.status
        }
      }).then(() => {
        setTimeout(() => {
          this.apiMessage = null
          this.apiError = null
        }, 5000)
      })
    }
  },
  computed: {
    price_euros: {
      get: function () {
        return Math.floor(this.book.price / 100)
      },
      set: function (newValue) {
        if (Number.isNaN(parseInt(newValue))) return
        this.book.price = newValue * 100 + this.price_cents
      }
    },
    price_cents: {
      get: function () {
        return this.book.price % 100
      },
      set: function (newValue) {
        if (Number.isNaN(newValue)) return
        if (newValue >= 100) return
        if (newValue === null || newValue === '') newValue = 0
        this.book.price = this.price_euros * 100 + parseInt(newValue)
      }
    },
    isAdmin: function () {
      // return false
      return this.$route.name === 'adminBookSingle'
    },
    isEditable: function () {
      return this.isAdmin || this.book.status === 0
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
@import '../styles/vars'

.modal-container {
  position: fixed
  top: 0;
  z-index: 20
  padding: 2em 2em
  width: calc(100% - 4em)
  height: calc(100% - 4em)
  overflow-y: scroll
}

#modal {
  background-color: #FFFFFF
  border-radius: 5px
  box-shadow: 1px 5px 20px rgba(0,0,0,0.9)
  padding: 2em 3em 2em 3em
  margin-bottom: 2em
}

.close {
  color: #555555
  text-decoration: none
  i.fa {
    font-size: 2em
    color: #444444
    vertical-align: -.1em
    padding-right: .2em
  }
  &:hover, &:active {
    text-decoration: underline;
  }
}

h2 {
  margin-bottom: 0
}

.left, .right {
  display: inline-block
  width: calc(50% - 1em)
  padding: 2em 0 1em 0
  vertical-align: top
}
.left {
  padding-right: 2em
}

.waiting {
  border: 5px solid _color-light-green-900
  border-radius: 10px
  padding: 2em 2em
  margin-top: 2em

  h2 {
    font-size: 2.5em !important
    margin-top: 0.4em
  }
}

.title {
  font-weight: 700
  font-size: 1.2em
  margin-top: 1em
  margin-bottom: 0.5em
}

.condition {
  white-space: nowrap
  color: #444444
  font-weight: 700

  i.fa {
    font-size: 2em
  }
  i.fa-star {
    color: _color-amber-700
  }
  i.fa-star-o {
    color: #BBBBBB
  }
}

textarea {
  width: 100%;
}

.price {
  font-size: 3.5em
  font-weight: 700
  margin-bottom: 1em
  color: #444444
}

div.danger {
  border: 1px solid _color-red-900
  background-color: lighten(_color-red-500, 40)
  border-radius: 3px
  padding: 0 1em 1em 1em

  h3 {
    font-size: 1em
    background-color: _color-red-900
    color: white
    text-align: center
    margin: 0 -1em
    border-radius: 1px 1px 0 0
  }
}

.bottom {
  text-align: center
}

.status {
  display: inline-block
  border-radius: 5px
  //padding: 0.6em 1em
  //margin-top: 0.6em
  padding-left: 1em;
  vertical-align: top

  &.block {
    display: block
    margin: 1em 0
  }

  i.fa {
    font-size: 3em
  }
  i.fa-trash {
    color: #AAAAAA
  }
  i.fa-check {
    color: _color-deep-purple-700
  }
  i.fa-sign-in, i.fa-clock-o {
    color: _color-orange-900
  }
  i.fa-sign-out {
    color: _color-green-900
  }
  i.fa-handshake-o {
    color: _color-amber-700

    &.green {
      color: _color-green-900
    }
  }
  i.fa-thumbs-up {
    color: _color-green-900
  }
  span>span {
    font-size: 1.2em
    font-weight: 700
    color: #555555
    vertical-align: .4em
    padding-left: .8em
  }
}

.box {
  display: inline-block;
  border: 1px solid #DDDDDD;
  padding: 1em;
  border-radius: 3px;
}

.api-message {
  color: _color-green-900;
  font-weight: 700;
}
.api-error {
  color: _color-red-900;
  font-weight: 700;
}



.fade {
  position: fixed
  top: 0
  left: 0
  height: 110%
  width: 100%
  background-color: rgba(0,0,0,0.5)
  z-index: 10
}

</style>
