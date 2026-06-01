if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/root/.gradle/caches/8.13/transforms/0b17c7b235c8f3b3b83e3834fa35af77/transformed/jetified-hermes-android-0.82.1-debug/prefab/modules/hermesvm/libs/android.arm64-v8a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/root/.gradle/caches/8.13/transforms/0b17c7b235c8f3b3b83e3834fa35af77/transformed/jetified-hermes-android-0.82.1-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

