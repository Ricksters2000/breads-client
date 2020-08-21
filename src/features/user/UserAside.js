import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import subscriptions from '../subscriptions';
import globalReadings from '../globalReadings';
import tags from '../tags';
import { fetchUserIfNeeded } from './actions';
import { getUserById } from './selectors';
import Card from '../../common/Card';
import Subscribe from '../../common/Subscribe';
import ReadingStats from '../../common/ReadingsStats';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const { getReadings, getWebsites, getUserReadingsInNeedOfUpdate } = globalReadings.selectors;
const { getFollowers, getFollowings } = subscriptions.selectors;

class UserAside extends Component {
    componentDidMount() {
        if (this.props.match) {
            this.props.fetchTagsIfNeeded(this.props.match.params.id, this.props.match.params.id);
            this.props.fetchUserIfNeeded(this.props.match.params.id);
            this.props.fetchSubscriptionsIfNeeded(this.props.match.params.id);
            this.props.fetchReadingsIfNeeded(this.props.match.params.id, this.props.match.params.id);
        } else {
            this.props.fetchSubscriptionsIfNeeded(this.props.currentUser.id);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.match && prevProps.match && this.props.match.params.id !== prevProps.match.params.id) {
            this.props.fetchTagsIfNeeded(this.props.match.params.id, this.props.match.params.id);
            this.props.fetchUserIfNeeded(this.props.match.params.id);
            this.props.fetchSubscriptionsIfNeeded(this.props.match.params.id);
            this.props.fetchReadingsIfNeeded(this.props.match.params.id, this.props.match.params.id);
        }
    }

    render() {
        let { readings, websites, loading, favorites, user, currentUser, outdated, followers, followings } = this.props;
        let totalReadings = 0,
            totalWebsites = 0,
            topWebsite = 'None',
            totalBooks = 0.0,
            totalWords = 0,
            maxReads = 0,
            totalFavorites = 0,
            totalOutdated = 0;

        let u = {};
        if (user) u = user;
        else u = currentUser;
        // if (!readings) u = currentUser;
        
        if (readings && readings.length > 0) {
            readings.forEach(r => {
                totalWords += r.word_count/100000;
            }); 

            totalReadings = readings.length;
            totalWebsites = Object.keys(websites).length;
            totalBooks = totalWords.toFixed(2);

            for (const prop in websites) {
                if (websites[prop] > maxReads) {
                    maxReads = websites[prop];
                    topWebsite = prop;
                }
            }
        }

        if (favorites) totalFavorites = favorites.length;
        if (outdated) totalOutdated = outdated.length;
        return (
            <Card image={u.image} username={u.username}>
                <div className='row pl-3 pr-3'>
                    <h4 className='card-title mr-auto'>{u.username}</h4>
                    {currentUser.id && currentUser.id === u.id && 
                        <NavLink exact to={`/${u.id}/edit`} className='text-warning'>
                            <FontAwesomeIcon icon={['far', 'edit']}/>
                        </NavLink>
                    }
                    <Subscribe user={u.id} />
                </div>
                <>
                    <NavLink exact to={`/${u.id}/following`} activeClassName='bg-light btn-outline-secondary' className='btn text-primary btn-sm readings-sum'>
                        Following: {followings ? followings.length : 0}
                    </NavLink>
                    <NavLink exact to={`/${u.id}/followers`} activeClassName='bg-light btn-outline-secondary' className='btn text-primary btn-sm readings-sum'>
                        Followers: {followers ? followers.length : 0}
                    </NavLink>
                </>
                <>
                    <NavLink exact to={`/${u.id}`} activeClassName='bg-light btn-outline-secondary' className='btn text-primary btn-sm readings-sum'>
                        <ReadingStats loading={loading} loading_id='userReadings' statName='Readings' stat={totalReadings}/>
                    </NavLink>
                    <NavLink exact to={`/${u.id}/favorites`} activeClassName='bg-light btn-outline-secondary' className='btn text-primary btn-sm favorites-sum'>
                        <ReadingStats loading={loading} loading_id='FavoriteReadings' statName='Favorites' stat={totalFavorites}/>
                    </NavLink>
                    {outdated && outdated.length > 0 &&
                        <NavLink exact to={`/${u.id}/outdated`} activeClassName='bg-light btn-outline-secondary' className='btn text-primary btn-sm favorites-sum'>
                            <ReadingStats loading={loading} loading_id='OutdatedReadings' statName='Outdated' stat={totalOutdated}/>
                        </NavLink>
                    }
                </>
                <>
                    <ReadingStats loading={loading} loading_id='userReadings' statName='Websites Read From' stat={totalWebsites}/>
                    <ReadingStats loading={loading} loading_id='userReadings' statName='Most Read Website' stat={topWebsite}/>
                    <ReadingStats loading={loading} loading_id='userReadings' statName='Loaves' stat={totalBooks}/>
                </>
            </Card>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        readings: getReadings(state, ownProps.match.params.id),
        websites: getWebsites(state, ownProps.match.params.id),
        favorites: getReadings(state, ownProps.match.params.id, ownProps.fav),
        user: getUserById(state, ownProps.match.params.id),
        outdated: getUserReadingsInNeedOfUpdate(state, ownProps.match.params.id),
        loading: state.loading,
        currentUser: state.currentUser.user,
        followings: ownProps.match ? getFollowings(state, ownProps.match.params.id) : null,
        followers: ownProps.match ? getFollowers(state, ownProps.match.params.id) : null,
    }
}

export default connect(mapStateToProps, { ...subscriptions.actions, ...globalReadings.actions, ...tags.actions, fetchUserIfNeeded })(UserAside);