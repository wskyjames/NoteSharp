angular.module('notesCtrl', ['angularMoment'])

	.controller('notesController', function($scope,
		                                    $http,
		                                    $firebase,
		                                    $q,
		                                    $window,
		                                    _,
		                                    notes) {

		// set data store url
		var dataURL = "https://shining-inferno-8888.firebaseio.com/notes";

		// firebase instance	
		var ref = new Firebase(dataURL);

		// Fetch notes on load
 		$scope.notes = notes.get(ref);
 		
 		// declare a watch to manage changes
		$scope.$watch('notes', function(){
			// count unread note
			$scope.setTotalUnread();

			// set latest unread note
			$scope.setLatestUnread();			
		}, true);

 		// spoof userid
 		$scope.uid = 2;


		
		/*-------------------------------------------------- 
		 |
		 | Functions for filtering, displaying and performing
		 | actions against notes.
		 |
		 --------------------------------------------------*/

		/**
		 * Filter notes ignored by users
		 * 
		 */
		$scope.filterIgnored = function(){	
			return _.filter($scope.notes, function(note){
				// check not has ignore list
				if(note.hasOwnProperty('ignore_list'))
				{
					// return if uid not in ignore list
					return !_.some(note.ignore_list, function(itm){
						return itm.id == $scope.uid;
					});
				}
				return note;					
			});	
		};		
		
		/**
		 * Count unread notes
		 * 
		 */
		$scope.setTotalUnread = function(){			
			// get count of un-read notes that aren't ignored
			$scope.unreadNotes = _.reduce($scope.filterIgnored() , function(ret, note){
				// exit if corrupt obj
				if(!angular.isObject(note) && 
				   !not.hasOwnProperty('is_read'))
				{
					return;	
				} 

				// return based on is_read property
				return ret += !note.is_read ? 1 : 0;

			}, 0);				
		}
		
		/**
		 * Configure the latest un-read noted
		 * 
		 */
		$scope.setLatestUnread = function(){
			// default note 
			$scope.selectedNote = {
				note: 'No un-read notes'
			};

			// if there are un-read notes, set the most recent
			if($scope.unreadNotes > 0)
			{
				// fetch all un-read notes that haven't been ignored
				var list = _.filter($scope.filterIgnored(), function(note){
					return !note.is_read;
				});	

				// set latest note to most recent item
				if(list.length > 0)
				{
					$scope.selectedNote = _.last(list); 
				} 

				// set time of note to provide relativaty
				this.time = new Date($scope.selectedNote.date);	
			}		
		}
 
		/**
		 * Mark a mark a note as read
		 * 
		 */
		$scope.setNoteRead = function(id){
			var itm = $scope.notes[id];
			itm.is_read = !itm.is_read;
			$scope.notes.$save(itm);
		};

		/**
		 * Mark a note as ignored
		 * 
		 */
		$scope.setNoteIgnored = function(id){
			var itm = $scope.notes[id];

			// check if this is the first ignore
			if(!itm.hasOwnProperty('ignore_list'))
			{				
				itm.ignore_list = [];
			}

			// add user id to list
			itm.ignore_list.push({
				'id': $scope.uid
			});

			$scope.notes.$save(itm);
		};

		/**
		 * Configure vars for displaying reply
		 *
		 */
		$scope.noteReply = false;
		$scope.toggleReply = function(){
			// toggle the view
			$scope.noteReply = !$scope.noteReply;

			// if replying
			if($scope.noteReply)
			{
				// configure data for reply and check lock
				$scope.configureNoteReply();
			}
			else
			{
				// unlock the note
				$scope.unlockNote($scope.selectedNote);
			}
		}

		/**
		 * Checks for lock by other user; otherwise lock
		 * set screen up and call to lock note
		 *
		 */
		$scope.configureNoteReply = function(){
			// check if note is locked against other user
			if($scope.notes[$scope.selectedNote.$id].hasOwnProperty('locked') &&
			   $scope.notes[$scope.selectedNote.$id].locked.id != $scope.uid)
			{
				// will replace with fancy alert or something better
				alert('Someone is already replying to this note');
			}	
			else
			{	
				// set the view sizes
				if(!$scope.viewLarge)
				{	
					$scope.setViewSize();
				}

				// set note to be locked				
				$scope.lockNote($scope.selectedNote);
			}	
		}

		/**
		 * Update data store setting lock to user
		 *
		 */
		$scope.lockNote = function(note){
			note.locked = {
				'id': $scope.uid
			};
			$scope.notes.$save(note);
		}

		/**
		 * Release note from lock
		 *
		 */
		$scope.unlockNote = function(note){
			delete note.locked;
			$scope.notes.$save(note);
		}
	

		/**
		 * Monitors activity and unlocks note
		 * if user is inactive for a long time
		 *
		 */
		$scope.unlockIfIdle = function(){
			// will implement ng-idle
		}

		/**
		 * Check if particular note was ignored
		 *
		 */
		$scope.wasIgnored = function(note){
			if(note.hasOwnProperty('ignore_list'))
			{
				// return if uid in ignore list
				return _.some(note.ignore_list, function(itm){
					return itm.id == $scope.uid;
				});
			}
		}


		/*----------------------------------
		|
		| General functions
		|
		-----------------------------------*/

		/**
		 * Toggle the view size for larger notes
		 *
		 */
		$scope.setViewSize = function(){
			$scope.viewLarge = !$scope.viewLarge;
			$scope.noteLarge = !$scope.noteLarge;
		}

		/**
		 * Toggle display for inbox
		 *
		 */
		$scope.viewInbox = false;
		$scope.toggleInbox = function(){
			$scope.viewInbox = !$scope.viewInbox;

			// set screen large if not already
			if(!$scope.viewLarge)
			{	
				$scope.setViewSize();
			}
		}

 });