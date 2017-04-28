<template>
  <div>
    <div class="modal-container">
      <div class="maxwidth" id="modal">
        <router-link to="/buy" @click="back" class="close"><i class="fa fa-times"></i> Sulje</router-link>
        <h2>{{ book.name }}</h2>

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
          <a href="#" class="button btn-l" :class="{'btn-disabled': book.status > 0}" @click.prevent="buyStatus = 1" v-if="!ownBook">
            Osta kirja
          </a>
          <h3 v-else>
            Et voi ostaa omaa kirjaasi
          </h3>
        </div>

        <div class="bottom" v-show="buyStatus == 1">
          <h3>Haluatko varmasti ostaa tämän kirjan?</h3>
          <a href="#" class="button btn-m" @click.prevent="buyStatus = 0">Peruuta</a>
          <a href="#" class="button btn-m" @click.prevent="confirm">Vahvista</a>
        </div>

        <div class="bottom" v-show="buyStatus == 2 || book.buyer === auth.id">
          <div class="status">
            <span v-if="book.status == 1"><i class="fa fa-check"></i>   <span>Sinä ostit<br>(odottaa toimitusta)</span></span>
            <span v-if="book.status == 2"><i class="fa fa-check"></i>   <span>Saatavissa kouluta</span></span>
            <span v-if="book.status == 2"><i class="fa fa-check"></i>   <span>Toimitettu</span></span>
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

export default {
  name: 'buy-single',
  components: {
    'currency': Currency
  },
  data () {
    return {
      auth: auth,
      book: {},
      buyStatus: 0 // 0: not active, 1: active, 2: success, 3: error
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
      }).catch(error => {
        console.log('Error ' + error.response.status)
      }).then(() => {
        EventBus.$emit('setLoading', false)
      })
    },
    back: function () {
      this.$router.go(-1)
    },
    confirm: function () {
      EventBus.$emit('setLoading', true)
      axios.post('/book/buy/' + this.id, {
        token: auth.getToken()
      }).then(response => {
        this.buyStatus = 2
        this.load()
      }).catch(error => {
        this.buyStatus = 3
        console.log('Error ' + error.response.status)
      }).then(() => {
        EventBus.$emit('setLoading', false)
      })
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

.info {
  /*border: 1px solid #CCCCCC
  border-radius: 5px
  padding: 2em 1em*/
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
  i.fa-check {
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
