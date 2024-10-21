const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const swapi = require('../apis/swapi');
const starwars = require('../controllers/starwars');
// swapi mocks
const swapiFilmListMock = require('../mocks/swapi/film_list.json');
// starwars mocks
const starwarsFilmListMock = require('../mocks/starwars/film_list.json');

describe('Film List', function() {
    afterEach(function() {
      swapi.films.restore();
    });
    it('should return all the star wars films when called', async function() {
      sinon.stub(swapi, 'films').returns(swapiFilmListMock);
      const response = await starwars.filmList();
      expect(response).to.deep.equal(starwarsFilmListMock);
    });
});