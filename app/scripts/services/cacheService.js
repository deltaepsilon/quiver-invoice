'use strict';

angular.module('quiverInvoiceApp')
  .service('cacheService', function cacheService($angularCacheFactory) {
    var qvCache = $angularCacheFactory('qvCache');

    qvCache.setOptions({
      maxAge: 3600000,
      deleteOnExpire: 'passive',
      storageMode: 'localStorage'
    });

    return {
      config: function (provider) {
        return provider.setDefaultHttpFields({cache: qvCache});
      },

      get: function () {
        return qvCache;
      }
    }
  });
