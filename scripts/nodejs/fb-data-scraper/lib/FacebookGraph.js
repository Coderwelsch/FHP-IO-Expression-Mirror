const
	FbGraph = require( "fbgraph" );
	Request = require( "request" );


class FacebookGraph {
	constructor ( accessToken = "" ) {
		this.accessToken = accessToken;

		FbGraph.setAccessToken( this.accessToken );
	}

	getRandomFriendFromLatestPostsLikes ( callback = null ) {
		this.getLatestPosts( ( error, data ) => {
			if ( error ) {
				callback( error );
			} else {
				let randomPost = data[ Number.parseInt( data.length * Math.random(), 10 ) ];

				this.getPostLikes( randomPost.id, ( error, data ) => {
					if ( error ) {
						callback( error );
					} else {
						let randomLiker = data[ Number.parseInt( data.length * Math.random(), 10 ) ];

						this.getPictureOfUser( randomLiker.id, ( error, data ) => {
							if ( error ) {
								callback( error );
							} else {
								callback( null, {
									id: randomLiker.id,
									name: randomLiker.name,
									imageData: data.picture.data
								} );
							}
						} );
					}
				} );
			}
		} );
	}

	getPictureOfUser ( userId = "", callback = null ) {
		FbGraph.get( `${ userId }?fields=picture.width(1920).height(1080)`, ( error, data ) => {
			if ( error ) {
				callback( error );
			} else {
				callback( null, data );
			}
		} );
	}

	getLatestPosts ( callback = null ) {
		FbGraph.get( "me?fields=posts", ( error, data ) => {
			if ( error ) {
				callback( error );
			} else {
				callback( null, data.posts.data );
			}
		} );
	}

	getPostLikes ( postId = "", callback = null ) {
		FbGraph.get( `${ postId }?fields=likes`, ( error, data ) => {
			if ( error ) {
				callback( error );
			} else {
				callback( null, data.likes.data );
			}
		} );
	}
}

module.exports = FacebookGraph;