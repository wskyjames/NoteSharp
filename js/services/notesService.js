angular.module('notesService', [])
	// fetch all notes
	.factory("notes", ['$firebase', '$rootScope',
		function($firebase, $rootScope) {
			return {
				get: function(ref){
				    // return syncd array
				    return $firebase(ref).$asArray();
				}
			}		    
		}
	])
;