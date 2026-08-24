package com.studysync.service;
import com.studysync.domain.*;
import com.studysync.dto.note.*;
import com.studysync.exception.NotFoundException;
import com.studysync.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service @RequiredArgsConstructor
public class NoteService {private final NoteRepository notes;private final CategoryService categories;
 @Transactional(readOnly=true)
 public Page<NoteResponse> list(User user,boolean archived,String q,int page,int size){return notes.search(user,archived,q==null||q.isBlank()?null:q.trim(),PageRequest.of(page,Math.min(size,100),Sort.by(Sort.Order.desc("pinned"),Sort.Order.desc("updatedAt")))).map(NoteResponse::from);}
 @Transactional
 public NoteResponse create(User user,NoteRequest req){return NoteResponse.from(notes.save(apply(new Note(),user,req)));}
 @Transactional
 public NoteResponse update(User user,UUID id,NoteRequest req){return NoteResponse.from(notes.save(apply(get(user,id),user,req)));}
 @Transactional
 public NoteResponse archive(User user,UUID id,boolean archive){Note n=get(user,id);n.setArchived(archive);return NoteResponse.from(notes.save(n));}
 @Transactional
 public void delete(User user,UUID id){notes.delete(get(user,id));}
 private Note get(User user,UUID id){return notes.findByIdAndUser(id,user).orElseThrow(()->new NotFoundException("Note not found"));}
 private Note apply(Note n,User u,NoteRequest r){n.setUser(u);n.setTitle(r.title().trim());n.setContent(r.content());n.setPinned(r.pinned());n.setCategory(r.categoryId()==null?null:categories.get(u,r.categoryId()));return n;}
}
