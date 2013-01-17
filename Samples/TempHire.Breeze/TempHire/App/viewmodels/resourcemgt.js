define(['services/unitofwork', 'logger', 'durandal/system', 'durandal/viewModel', 'viewmodels/details'],
    function (unitofwork, logger, system, viewModel, details) {

        var staffingResources = ko.observableArray();
        var uow = unitofwork.create();
        var activeDetail = viewModel.activator();

        var vm = {
            title: "Resource Management",
            staffingResources : staffingResources,
            activeDetail : activeDetail,
            activate: activate,
            deactivate : deactivate,
            viewAttached : viewAttached
        };

        return vm;
        
        function activate() {
            activeDetail.activate();
            
            return uow.staffingResourceListItems.all()
                .then(querySucceeded)
                .fail(handleError);
            
            function querySucceeded(data) {
                staffingResources(data);
                log("StaffingResourceListItems loaded", true);
            }
        }
        
        function deactivate(close) {
            return activeDetail.deactivate(close);
        }
        
        function viewAttached(view) {
            $(view).on('click', '.selectable-row', function() {
                var staffingResource = ko.dataFor(this);

                var detail = new details(staffingResource.id);
                activeDetail.activateItem(detail);

                return false;
            });
        }
        
        function handleError(error) {
            logger.log(error.message, null, system.getModuleId(vm), true);
            throw error;
        }
        
        function log(message, showToast) {
            logger.log(message, null, system.getModuleId(vm), showToast);
        }
    });