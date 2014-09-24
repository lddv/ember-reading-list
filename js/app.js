App = Ember.Application.create();

App.Router.map(function() {
  this.resource('book', { path: '/books/:book_id' });
  this.resource('genre', { path: '/genres/:genre_id' });
  this.resource('reviews', function(){
    this.route('new');
  });
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return Ember.RSVP.hash({
      books: this.store.findAll('book'),
      genres: this.store.findAll('genre')
    });
  },
  setupController: function(controller, model){
    controller.set('books', model.books);
    controller.set('genres', model.genres);
  }
});

// Default behavior !!!
// App.BookRoute = Ember.Route.extend({
//   model: function(params) {
//     return this.store.find('book', params.book_id);
//   }
// });

App.ReviewsNewRoute = Ember.Route.extend({
  model: function() {
    return Ember.RSVP.hash({
      book: this.store.createRecord('book'),
      genres: this.store.findAll('genre')
    });
  },
  setupController: function(controller, model){
    controller.set('model', model.book);
    controller.set('genres', model.genres);
  },
  actions: {
    willTransition: function(transition){
      if (this.currentModel.book.get('isNew')) {
        if (confirm("Are you sure you want to abandon progress?")) {
          this.currentModel.book.destroyRecord();
        } else {
          transition.abort();
        }
      }
    }
  }
});

App.IndexController = Ember.Controller.extend({});

App.BooksController = Ember.ArrayController.extend({
  sortProperties: ['title']
});

App.GenresController = Ember.ArrayController.extend({
  sortProperties: ['name']
});

App.ReviewsNewController = Ember.Controller.extend({
  ratings: [5,4,3,2,1],
  actions: {
    createReview: function(){
      var controller = this;
      this.get('model').save().then(function(){
        controller.transitionToRoute('index');
      });
    }
  }
});

App.ApplicationAdapter = DS.FixtureAdapter.extend();

App.BookDetailsComponent = Ember.Component.extend({
  classNameBindings: ['ratingClass'],
  ratingClass: function(){
    return 'rating-'+this.get('book.rating');
  }.property('book.rating')
});

App.Book = DS.Model.extend({
  title: DS.attr(),
  author: DS.attr(),
  review: DS.attr(),
  rating: DS.attr('number'),
  amazon_id: DS.attr(),
  genre: DS.belongsTo('genre'),
  url: function(){
    return "http://www.amazon.com/gp/"+this.get('amazon_id')+"/otherstuff";
  }.property('amazon_id'),
  image: function(){
    return "http://images.amazon.com/images/P/"+this.get('amazon_id')+".01.ZTZZZZZZ.jpg";
  }.property('amazon_id')
});

App.Book.FIXTURES = [
  {
    id: 1,
    title: 'Mindstorms',
    author: 'Seymour A. Papert',
    review: 'bla bla bla from Mindstorms',
    rating: 5,
    amazon_id: '0465046746',
    genre: 3,
    url: 'http://www.amazon.com/Mindstorms-Children-Computers-Powerful-Ideas/dp/0465046746',
    image: 'img/mindstorms.jpg'
  },
  {
    id: 2,
    title: 'Hyperion',
    author: 'Dan Simmons',
    review: 'bla bla bla from Hyperion',
    rating: 5,
    amazon_id: '0553283685',
    genre: 1
  },
  {
    id: 3,
    title: 'Jony Ive',
    author: 'Leander Kahney',
    review: 'bla bla bla from Jony Ive',
    rating: 2,
    amazon_id: '159184617X',
    genre: 3
  }
];

App.Genre = DS.Model.extend({
  name: DS.attr(),
  books: DS.hasMany('book', {async: true})
});

App.Genre.FIXTURES = [
  {
    id: 1,
    name: 'Science Fiction',
    books: [2]
  },
  {
    id: 2,
    name: 'Fiction'
  },
  {
    id: 3,
    name: 'Non-Fiction',
    books: [1,3]
  }
];