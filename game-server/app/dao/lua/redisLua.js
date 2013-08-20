/**
 * Created with JetBrains WebStorm.
 * User: qinjiao
 * Date: 13-8-20
 * Time: 下午8:54
 * To change this template use File | Settings | File Templates.
 */
module.exports = {
    mailLua:{
        delMailLua:
            "redis.call('select' ,KEYS[1] ); \
            local all =redis.call('LRANGE',KEYS[2],0,-1); \
            local count = table.getn(all); \
            for key , value in pairs(all) do \
                if cjson.decode(value)['mailId'] == KEYS[3] then \
                    local order = 1; \
                    if count/2 > key then \
                        order = -1;\
                    end\
                    if redis.call('LREM', KEYS[2],order,value) == 1 then\
                        return value\
                    end \
                end \
            end " ,
        insertMailLua:
            "local function insert(startIndex,endIndex,key,all) \
            local m = math.ceil((startIndex+endIndex)/2);   \
            local time = cjson.decode(all[m])['time']   \
            if (startIndex +1) == endIndex then \
                return startIndex   \
            end    \
            if  time == key then    \
                return m;   \
            elseif time < key then  \
                return insert(startIndex,m,key,all);    \
            else    \
                 return insert(m,endIndex,key,all);  \
            end                                  \
            end                                   \
            redis.call('select' ,KEYS[1] );        \
            local all =redis.call('LRANGE',KEYS[2],0,-1);\
            local count = table.getn(all);                \
            local index ;                                  \
            local time = cjson.decode(KEYS[3])['time']      \
            if count == 0 then \
                return redis.call('LPUSH',KEYS[2],KEYS[3])    \
            end \
            if cjson.decode(all[1])['time'] < time then      \
                return	redis.call('LINSERT',KEYS[2],'BEFORE',all[1],KEYS[3]);\
            elseif cjson.decode(all[count])['time'] > time then            \
                index = count;                                                  \
            else                                                             \
                index = insert(1,count,time,all);                                 \
            end                                                                \
            return redis.call('LINSERT',KEYS[2],'AFTER',all[index],KEYS[3]);"
    }
}