<template>
  <div>
    <div class="modal-container">
      <div class="maxwidth" id="modal">
        <router-link v-if="auth.id === book.buyer" to="/buy/bought" class="close"><i class="fa fa-times"></i> Sulje</router-link>
        <router-link v-else to="/buy" @click.prevent="back" class="close"><i class="fa fa-times"></i> Sulje</router-link>

        <h2>{{ book.name }}</h2>

        <div class="getfromschool" v-if="book.status == 2">
          <h2>Kirjasi on saatavissa koululta!</h2>
          <h3>Saat lisätietoja myynnistä vastaavalta taholta</h3>
        </div>

        <div class="left">

          <div class="title">Kurssi:</div>
          <p class="info" v-if="book.course">{{ book.course }}</p>
          <p class="info" v-else>Ei määritelty</p>

          <div class="title">Kuvaus:</div>
          <p class="info" v-if="book.info">{{ book.info }}</p>
          <p class="info" v-else>Ei lisätietoja</p>

        </div><div class="right">

          <div class="title">Kunto:</div>
          <div class="condition">
            <div v-if="book.condition != null">
              <i class="fa fa-star" v-for="n in book.condition"></i><i class="fa fa-star-o" v-for="n in 5-book.condition"></i>
            </div>
            <span v-if="book.condition == 0">Ei määritelty</span>
            <span v-if="book.condition == 1">Surkea</span>
            <span v-if="book.condition == 2">Välttävä</span>
            <span v-if="book.condition == 3">Kohtalainen</span>
            <span v-if="book.condition == 4">Hyvä</span>
            <span v-if="book.condition == 5">Erinomainen</span>
          </div>

        </div>

        <div class="title">Hinta:</div>
        <div class="price"><currency :amount="book.price" /></div>

        <div class="bottom" v-show="buyStatus == 0 && book.buyer !== auth.id">
          <div class="status">
            <span v-if="book.status == 0"><i class="fa fa-check"></i>   <span>Saatavilla</span></span>
            <span v-if="book.status == 1"><i class="fa fa-clock-o"></i> <span>Varattu</span></span>
            <span v-if="book.status >= 2"><i class="fa fa-times"></i>   <span>Myyty</span></span>
          </div>
          <a href="#" class="button btn-l" :class="{'btn-disabled': book.status > 0}" @click.prevent="requestConfirm" v-if="!ownBook">
            Osta kirja
          </a>
          <h3 v-else>
            Et voi ostaa omaa kirjaasi
          </h3>
          <div class="info">
            Saat kirjan koululta ensimmäisien koulupäivien aikana!
          </div>
        </div>

        <div class="bottom" v-show="buyStatus == 1 && auth.status == 1">
          <h2>Anna yhteystietosi</h2>
          <b>Meidän pitää tietää kenelle kirja tulee toimittaa</b>
          <form class="">
            <label>Etunimi:</label>
            <input type="text" placeholder="Etunimi" v-model="buyer_info.firstname" />
            <label>Sukunimi:</label>
            <input type="text" placeholder="Sukunimi" v-model="buyer_info.lastname" />
            <label>Sähköposti:</label>
            <input type="email" placeholder="Sähköpostiosoite" v-model="buyer_info.email" />
          </form>
          <b>Saat sähköpostiin ilmoituksen kun kirja on saatavilla koululta.</b><br>
          <a href="#" class="button btn-m" @click.prevent="buyStatus = 0">Peruuta</a>
          <a href="#" class="button btn-m" @click.prevent="confirm">Vahvista</a>
        </div>
        <div class="bottom" v-show="buyStatus == 1 && auth.status >= 2">
          <h3>Haluatko varmasti ostaa tämän kirjan?</h3>
          <a href="#" class="button btn-m" @click.prevent="buyStatus = 0">Peruuta</a>
          <a href="#" class="button btn-m" @click.prevent="confirm">Vahvista</a>
        </div>
        <div class="bottom" v-show="buyStatus == 2 || book.buyer === auth.id">
          <div class="status">
            <span v-if="book.status == 1"><i class="fa fa-check"></i>   <span>Ostettu - odottaa saapumista</span></span>
            <span v-if="book.status == 2"><i class="fa fa-check"></i>   <span>Nouda koululta!</span></span>
            <span v-if="book.status == 3"><i class="fa fa-handshake-o"></i>   <span>Ostettu</span></span>
          </div>
        </div>

        <div class="bottom" v-show="buyStatus == 3">
          <h3>Kirjan ostossa tapahtui virhe</h3>
        </div>
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
import {APP_FEE, OPERATION_FEE, TOTAL_FEE} from '../Static'

export default {
  name: 'buy-single',
  components: {
    'currency': Currency
  },
  data () {
    return {
      auth: auth,
      book: {},
      buyStatus: 0, // 0: not active, 1: active, 2: success, 3: error,
      buyer_info: {
        firstname: '',
        lastname: '',
        email: ''
      }
    }
  },
  props: ['id'],
  created () {
    // console.log(this.$route.params.id)
    this.load()
  },
  methods: {
    load: function () {
      EventBus.$emit('setLoading', true)
      axios.post('/book/get/' + this.id, {
        token: auth.getToken()
      }).then(response => {
        this.book = response.data.data
        ga('ec:addProduct', {
          'id': this.book.id,
          'name': this.book.name,
          'category': this.book.course,
          'price': this.book.price / 100,
          'dimension2': this.book.condition
        })
        ga('ec:setAction', 'detail')
        ga('send', 'event', 'book', 'impression', {'nonInteraction': true})
      }).catch(error => {
        console.log('Error ' + error.response.status)
      }).then(() => {
        EventBus.$emit('setLoading', false)
      })
    },
    requestConfirm: function () {
      ga('ec:setAction', 'checkout', {
        'step': 1
      })
      ga('send', 'event', 'book', 'buy', {'nonInteraction': true})
      this.buyStatus = 1
    },
    confirm: function () {
      EventBus.$emit('setLoading', true)
      axios.post('/book/buy/' + this.id, {
        token: auth.getToken()
      }).then(response => {
        this.buyStatus = 2
        ga('ec:setAction', 'purchase', {
          'id': this.book.id,
          'revenue': this.book.price - TOTAL_FEE,
          'tax': APP_FEE,
          'shipping': OPERATION_FEE
        })
        ga('send', 'event', 'book', 'buy', {'nonInteraction': true})
        this.load()
      }).catch(error => {
        this.buyStatus = 3
        console.log('Error ' + error.response.status)
      }).then(() => {
        EventBus.$emit('setLoading', false)
      })
    },
    back: function () {
      this.$router.go(-1)
    }
  },
  computed: {
    ownBook: function () {
      return this.book.user === auth.id
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
}

.getfromschool {
  border: 5px solid _color-light-green-900
  border-radius: 10px
  padding: 2em 2em
  margin-top: 2em

  h2 {
    font-size: 2.5em !important
    margin-top: 0.4em
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

.price {
  font-size: 3.5em
  font-weight: 700
  margin-bottom: 1em
  color: #444444
}

.bottom {
  text-align: center

  form {
    display: block
    max-width: 20em
    margin: 2em auto

    label {
      display: block
      font-size: 1em
      font-weight: 700
      text-align: left
      margin-top: 1em
    }
    input {
      display: block
      width: 100%
      padding: 0.5em 0.5em
    }
  }
}

.status {
  display: inline-block
  border-radius: 5px
  padding: 0.6em 1em
  margin-top: 1.3em
  vertical-align: top

  i.fa {
    font-size: 3em
  }
  i.fa-check, i.fa-handshake-o {
      color: _color-green-900
  }
  i.fa-clock-o {
      color: _color-orange-900
  }
  i.fa-times {
      color: _color-red-900
  }
  span>span {
    font-size: 1.2em
    font-weight: 700
    color: #555555
    vertical-align: .4em
    padding-left: .8em
  }
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
