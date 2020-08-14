import React, { Component } from 'react';
import { API_URL, API_KEY } from '../../config';
import Navigation from '../elements/Navigation/Navigation';
import MovieInfo from '../elements/MovieInfo/MovieInfo';
import MovieInfoBar from '../elements/MovieInfoBar/MovieInfoBar';
import FourColGrid from '../elements/FourColGrid/FourColGrid';
import Actor from '../elements/Actor/Actor';
import Spinner from '../elements/Spinner/Spinner';
import './Movie.css';

class Movie extends Component {
    state = {
        movie: null,
        actors: null,
        directors: [],
        loading: false
    }

    componentDidMount() {
        const { movieId } = this.props.match.params;

        if (localStorage.getItem(`${movieId}`)) {
            const state = JSON.parse(localStorage.getItem(`${movieId}`));
            this.setState({ ...state });
        } else {
            this.setState({ loading: true })
            // First fetch the movie... 
            const endpoint = `${API_URL}movie/${movieId}?api_key=${API_KEY}&language=en-US`;
            this.fetchItems(endpoint);
        }
    }

    fetchItems = async endpoint => {
        const { movieId } = this.props.match.params;
        try {
            const result = await (await fetch(endpoint)).json();
            if (result.status_code) {
                this.setState({ loading: false });
            } else {
                this.setState({ movie: result })
                const creditsEndpoint = `${API_URL}movie/${movieId}/credits?api_key=${API_KEY}`;
                const creditsResult = await (await fetch(creditsEndpoint)).json();
                const directors = creditsResult.crew.filter((member) => member.job === 'Director');

                this.setState({
                    actors: creditsResult.cast,
                    directors,
                    loading: false
                }, () => {
                    localStorage.setItem(`${movieId}`, JSON.stringify(this.state));
                })

            }
        }
        catch (e) {
            console.log('Dude, there was an error in the Movie.js', e);
        }

    }

    render() {
        const { movie, actors, directors, loading } = this.state;

        return (
            <div className="rmdb-movie">
                {movie ?
                    <div>
                        <Navigation movie={movie.original_title} />
                        <MovieInfo movie={movie} directors={directors} />
                        <MovieInfoBar time={movie.runtime} budget={movie.budget} revenue={movie.revenue} />
                    </div>
                    : null}
                {actors ?
                    <div className="rmdb-movie-grid">
                        <FourColGrid header={'Actors'}>
                            {actors.map((element, i) => {
                                return <Actor key={i} actor={element} />
                            })}
                        </FourColGrid>
                    </div>
                    : null}
                {!actors && !loading ? <h1>No Movie Found!</h1> : null}
                {loading ? <Spinner /> : null}
            </div>
        )
    }
}

export default Movie;