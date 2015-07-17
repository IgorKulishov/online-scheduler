describe('First scheduler test', function() {
    beforeEach(module('scheduleOfTeam'));
    
    var ctrl;
    
    beforeEach(inject(function($controller) {
        ctrl = $controller('scheduleController');
    }));

    it('check for available tasks', function() {
        var taskController = ctrl.taskListArray;
        expect(taskController).toBeTruthy();
    });

});