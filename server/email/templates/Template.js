var juice = require('juice')
var Twig = require('twig')

class Template {
  constructor(action) {
    this._data = {
      'action': action
    }
    this._user = action.user;
    this._object = action.object;
  }

  get subject() {
    return this._subject
  }

  get text() {
    return Twig.twig({
      data: this._textTemplate
    }).render(
      this._data
    )
  }

  get html() {
    return juice(
      Twig.twig({
        data: this._htmlTemplate
      }).render(
        this._data
      )
    )
  }
}

module.exports = Template
