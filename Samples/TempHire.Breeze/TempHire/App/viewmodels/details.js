define(['services/unitofwork', 'logger', 'durandal/system', 'durandal/viewModel', 'viewmodels/contacts', 'durandal/app'],
    function(unitofwork, logger, system, viewModel, contacts, app) {

        return (function() {

            var details = function(id) {
                this.title = 'Details View';
                this.staffingResourceId = id;
                this.staffingResource = ko.observable();
                this.initialized = ko.observable();
                this.hasNothingToSave = ko.observable(true);
                
                var ref = unitofwork.get(id);
                this.unitOfWork = ref.value();

                this.contacts = viewModel.activator();
            };

            details.prototype.activate = function () {
                this.contacts.activate();

                if (this.initialized())
                    return true;
                
                // Subscribe to events
                app.on('hasChanges', function() {
                    this.hasNothingToSave(!this.unitOfWork.hasChanges());
                }, this);

                var vm = this;
                return this.unitOfWork.staffingResources.withId(this.staffingResourceId)
                    .then(function(data) {
                        vm.staffingResource(data);
                        vm.log("StaffingResource loaded", true);
                    })
                    .then(function() {
                        vm.contacts.activateItem(new contacts(vm.staffingResourceId));
                    })
                    .then(function () {
                        vm.initialized(true);
                        return true;
                    })
                    .fail(this.handleError);
            };

            details.prototype.deactivate = function(close) {
                if (close) {
                    unitofwork.get(this.staffingResourceId).release();
                    app.off(null, null, this);
                    this.initialized(false);
                }

                this.contacts.deactivate(close);

                return true;
            };

            details.prototype.save = function() {
                this.unitOfWork.commit().fail(this.handleError);
            };

            details.prototype.cancel = function() {
                this.unitOfWork.rollback();
            };

            details.prototype.handleError = function(error) {
                logger.log(error.message, null, system.getModuleId(this), true);
                throw error;
            };

            details.prototype.log = function(message, showToast) {
                logger.log(message, null, system.getModuleId(this), showToast);
            };

            return details;
        })();
    });