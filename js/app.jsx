/*global require*/
"use strict";

var React = require('react');
var ReactDOM = require('react-dom');
var immstruct = require('immstruct');
var Immutable = require('immutable');

document.addEventListener("DOMContentLoaded", function(event) {
  ReactDOM.render(
    <App />,
    document.getElementById('app')
  );
});


var App = React.createClass({
  getInitialState: function(){
    var structure = immstruct('survey-data', { newSurveyName: '', surveys: [] });
    structure.on('swap', function (newStructure, oldStructure, keyPath) {
      this.setState({ cursor: immstruct('survey-data').cursor() });
    }.bind(this));
    return {
      cursor: structure.cursor(),
      newSurveyName: '',
    };
  },

  updateNewSurveyName: function(e) {
    this.state.cursor.cursor('newSurveyName').update(function(){
      return e.target.value;
    }.bind(this));
  },

  createSurvey: function(e) {
    e.preventDefault();
    var name = this.state.cursor.cursor('newSurveyName').deref().trim();
    if (name) {
      this.state.cursor.cursor('surveys').update(function(surveys){
        var s = surveys.push(Immutable.fromJS({ name: name, questions: [] }));
        return s;
      }.bind(this));
      this.state.cursor.cursor('newSurveyName').update(function() {
        return '';
      });
    }
  },

  removeSurvey: function(i) {
    this.state.cursor.cursor('surveys').delete(i);
  },

  render: function(){
    return <div>
      <h1>Survery Builder</h1>
      <div className='pure-g'>
        <div className='pure-u-1-2'>
          <form className='pure-form' onSubmit={this.createSurvey}>
            <p>
              <button
                type='button'
                className='pure-button'
                placeholder='survey name'
                onClick={this.createSurvey}
              >
                <i className='fa fa-plus-circle'></i> Create Survey
              </button>
              {' '}
              <input
                type='text'
                id=''
                value={this.state.cursor.cursor('newSurveyName').deref()}
                onChange={this.updateNewSurveyName}
              />
            </p>
          </form>

          {this.state.cursor.cursor('surveys').toJS().map(function(s, i){
            return <Survey key={i} removeSurvey={this.removeSurvey.bind(this, i)} survey={this.state.cursor.cursor(['surveys', i])} />;
          }.bind(this))}
        </div>
        <div className='pure-u-1-2'>
          <pre>{JSON.stringify(this.state.cursor.toJS(), undefined, '  ')}</pre>
        </div>
      </div>
    </div>;
  }
});

var Survey = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState){
    return nextProps.survey.deref() !== this.props.survey.deref();
  },

  createQuestion: function(e) {
    e.preventDefault();
    var name = this.props.survey.cursor('newQuestion').deref();
    if (name) {
      this.props.survey.cursor('questions').update(function(questions){
        var q = Immutable.fromJS({name: name, newAnswer: '', answers: [] });
        return questions.push(q);
      }.bind(this));
      this.props.survey.cursor('newQuestion').update(function() {
        return '';
      });
    }
  },

  removeQuestion: function(i) {
    this.props.survey.cursor('questions').delete(i);
  },

  updateNewQuestion: function(e) {
    this.props.survey.cursor('newQuestion').update(function(){
      return e.target.value;
    }.bind(this));
  },

  render: function() {
    var s = this.props.survey;
    console.log('render survey', s.cursor('name').deref());
    console.log('rendering survey');
    return <div className='survey'>
      <h3>
        Survey: {s.cursor('name').deref()}
      </h3>
      <p>
        <button type='button' className='pure-button button-error button-xsmall' onClick={this.props.removeSurvey}>
          <i className='fa fa-minus-circle'></i> Remove Survey
        </button>
      </p>
      <form className='pure-form' onSubmit={this.createQuestion}>
        <button className='pure-button' type='button' onClick={this.createQuestion}>
          <i className='fa fa-plus-circle'></i> Create Question
        </button>
        {' '}
        <input
          type='text'
          id=''
          value={s.cursor('newQuestion').deref() || ''}
          onChange={this.updateNewQuestion}
          placeholder='question'
        />
      </form>
      {this.props.survey.cursor('questions').toJS().map(function(q, i){
        return <Question key={i} question={s.cursor(['questions', i])} removeQuestion={this.removeQuestion.bind(this, i)} />;
      }.bind(this))}
    </div>;
  }
});

var Question = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState){
    return nextProps.question.deref() !== this.props.question.deref();
  },

  updateAnswer: function(e) {
    this.props.question.cursor('newAnswer').update(function(){
      return e.target.value;
    });
  },

  createAnswer: function(e) {
    e.preventDefault();

    var q = this.props.question;
    var name = q.cursor('newAnswer').deref().trim();

    if (name) {
      q.cursor('answers').update(function(answers) {
        return answers.push(Immutable.fromJS({name: name }));
      });
      q.cursor('newAnswer').update(function(){
        return '';
      });
    }
  },

  removeAnswer: function(i, e) {
    this.props.question.cursor('answers').update(function(answers){
      return answers.delete(i);
    }.bind(this));
  },

  render: function() {
    var q = this.props.question;
    console.log('render question', q.cursor('name').deref());
    var answers = q.cursor('answers').toJS() || [];
    return <div className='question'>
      <h4>Question: {q.cursor('name').deref()}</h4>
      <p>
        <button type='button' className='pure-button button-error button-xsmall' onClick={this.props.removeQuestion}>
          <i className='fa fa-minus-circle'></i> Remove Question
        </button>
      </p>
      <form onSubmit={this.createAnswer} className='pure-form'>
        <button type='submit' className='pure-button'>
          <i className='fa fa-plus-circle'></i> Add Answer
        </button>
        {' '}
        <input
          type='text'
          id=''
          value={q.cursor('newAnswer').deref() || ''}
          onChange={this.updateAnswer}
          placeholder='new answer'
        />
      </form>
      <ul className='answer-list'>
        {answers.map(function(a, i){
          return <li key={i}>
            <button type='button' className='pure-button button-xsmall button-error' onClick={this.removeAnswer.bind(this, i)}>
              <i className='fa fa-minus-circle'></i> Remove
            </button>
            {' '}
            <Answer answer={q.cursor(['answers', i])} />
          </li>;
        }.bind(this))}
      </ul>
    </div>;
  }
});

var Answer = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState){
    return nextProps.answer.deref() !== this.props.answer.deref();
  },

  render: function() {
    console.log('render answer', this.props.answer.cursor('name').deref());
    return <span>
      {this.props.answer.cursor('name').deref()}
    </span>;
  }
});