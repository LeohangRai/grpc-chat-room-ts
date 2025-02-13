PROTOC=node_modules/.bin/grpc_tools_node_protoc
PROTOC_GEN_TS=node_modules/.bin/protoc-gen-ts
PROTO_DIR=protos
PROTO_OUT_DIR=./src/proto-out

generate:
	mkdir -p $(PROTO_OUT_DIR)
	
	$(PROTOC) \
	--js_out=import_style=commonjs,binary:./$(PROTO_OUT_DIR) \
	--grpc_out=grpc_js:./$(PROTO_OUT_DIR) \
	-I $(PROTO_DIR) $(PROTO_DIR)/*.proto

	$(PROTOC) \
	--plugin=protoc-gen-ts=$(PROTOC_GEN_TS) \
	--ts_out=grpc_js:./$(PROTO_OUT_DIR) \
	-I $(PROTO_DIR) $(PROTO_DIR)/*.proto

gen: generate # alias for 'generate'

clean:
	rm $(PROTO_OUT_DIR)/*

regenerate: clean generate # alias for 'clean' and 'generate'

regen: regenerate # alias for 'regenerate'